import {
  isRenewalLikeTransaction,
  isPackageChangeTransaction,
  isOwnershipTransferOutTransaction,
  requiresListedMsisdn,
  normalizeAirtimeMsisdn,
  isValidAirtimeMsisdn,
  isZeroOrNullDevicePrice,
} from "./airtimeMsisdn";
import {
  isValidSpectraAccountNumber,
  normalizeSpectraAccountNumber,
} from "./spectraPackages";

export const normalizePackageName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getContractDevicePrice = (contract) =>
  contract?.device_initial_cost ??
  contract?.device_initail_cost ??
  contract?.DevicePrice ??
  contract?.device_price ??
  null;

const getContractPayoutBalance = (contract) =>
  contract?.device_payout_balance ??
  contract?.PayoutBalance ??
  contract?.DevicePayoutBalance ??
  null;

/**
 * Build MSISDN → active CDR contract map for renewal / package-change flows.
 * Prefers active status when duplicates exist.
 * Spectra mode: free-form account numbers (not 81 MSISDN format).
 */
export const buildRenewalContractMap = (
  contracts = [],
  { packageMode = "airtime" } = {}
) => {
  const isSpectraMode = packageMode === "spectra";
  const map = new Map();

  (contracts || [])
    .filter((contract) => !contract?.isSubmission)
    .forEach((contract) => {
      const raw =
        contract.msisdn || contract.MSISDN || contract.staff_msisdn || "";
      const msisdn = isSpectraMode
        ? normalizeSpectraAccountNumber(raw)
        : normalizeAirtimeMsisdn(raw);
      if (isSpectraMode) {
        if (!isValidSpectraAccountNumber(msisdn)) return;
      } else if (!isValidAirtimeMsisdn(msisdn)) {
        return;
      }

      const status = String(
        contract.subscription_status || contract.SubscriptionStatus || ""
      )
        .trim()
        .toLowerCase();
      if (
        status === "cancelled" ||
        status === "canceled" ||
        status === "done"
      ) {
        return;
      }

      const packageName = contract.package || contract.PackageName || "";
      const packageMonthly =
        parseFloat(
          contract.serviceplan_monthly_price ??
            contract.PackageMonthlyPayment ??
            contract.package_price
        ) || 0;
      const deviceInitialCost = getContractDevicePrice(contract);
      const devicePayoutBalance = getContractPayoutBalance(contract);
      const isZeroPayout = isZeroOrNullDevicePrice(devicePayoutBalance);
      const isFreeDevice = isZeroOrNullDevicePrice(deviceInitialCost);

      const entry = {
        msisdn,
        packageName,
        packageMonthly,
        deviceInitialCost,
        devicePayoutBalance,
        isZeroPayout,
        isFreeDevice,
        // Package Change: only lines with no outstanding payout (and free/zero device).
        isPackageChangeEligible: isZeroPayout && isFreeDevice,
        status,
        contract,
      };

      const existing = map.get(msisdn);
      if (!existing || (status === "active" && existing.status !== "active")) {
        map.set(msisdn, entry);
      }
    });

  return map;
};

export const getRenewalContractForMsisdn = (renewalMap, msisdn) => {
  if (!renewalMap) return null;
  const trimKey = normalizeSpectraAccountNumber(msisdn);
  const digitKey = normalizeAirtimeMsisdn(msisdn);
  return (
    renewalMap.get(trimKey) ||
    (digitKey ? renewalMap.get(digitKey) : null) ||
    null
  );
};

export const doesSelectedPackageMatchRenewalContract = (
  selectedPackageName,
  renewalContract
) => {
  if (!renewalContract) return false;
  const selected = normalizePackageName(selectedPackageName);
  const existing = normalizePackageName(renewalContract.packageName);
  return Boolean(selected && existing && selected === existing);
};

/**
 * MSISDN options for the selected transaction type.
 * Device Benefits (airtime):
 * - Renewal, Package Change, Ownership Transfer Out: payout 0/null only.
 *   Outstanding payout is not listed. Device price does not hide the line.
 * Spectra keeps the previous rules:
 * - Package Change: payout 0/null and free device
 * - Renewal / Upgrade: outstanding payout, else billed device, else all
 * - Ownership Transfer Out: all listed MSISDNs
 * Ownership Transfer In and other types: none (typed manually or not required)
 */
export const getMsisdnOptionsForTransactionType = (
  renewalMap,
  subscriptionType,
  { packageMode = "airtime" } = {}
) => {
  const entries = Array.from(renewalMap?.values?.() || []);
  const isDeviceBenefit = packageMode !== "spectra";

  if (isDeviceBenefit) {
    if (
      isRenewalLikeTransaction(subscriptionType) ||
      isPackageChangeTransaction(subscriptionType) ||
      isOwnershipTransferOutTransaction(subscriptionType)
    ) {
      return entries.filter((entry) => entry.isZeroPayout);
    }

    return [];
  }

  if (isPackageChangeTransaction(subscriptionType)) {
    return entries.filter((entry) => entry.isPackageChangeEligible);
  }

  if (isRenewalLikeTransaction(subscriptionType)) {
    const withPayout = entries.filter((entry) => !entry.isZeroPayout);
    if (withPayout.length) return withPayout;
    const billed = entries.filter((entry) => !entry.isFreeDevice);
    // Package-only lines (e.g. Spectra) have no device — still list those MSISDNs.
    return billed.length ? billed : entries;
  }

  if (isOwnershipTransferOutTransaction(subscriptionType)) {
    return entries;
  }

  return [];
};

/** True when a typed/selected MSISDN is allowed for the transaction type. */
export const isMsisdnAllowedForTransactionType = (
  renewalMap,
  subscriptionType,
  msisdn,
  { packageMode = "airtime" } = {}
) => {
  if (!requiresListedMsisdn(subscriptionType)) return true;
  const normalized = normalizeAirtimeMsisdn(msisdn);
  if (!isValidAirtimeMsisdn(normalized)) return false;

  const entry = getRenewalContractForMsisdn(renewalMap, normalized);

  if (!entry) return true;

  if (packageMode !== "spectra") {
    // Device Benefits: a known line with payout above 0 cannot be used.
    if (
      isRenewalLikeTransaction(subscriptionType) ||
      isPackageChangeTransaction(subscriptionType) ||
      isOwnershipTransferOutTransaction(subscriptionType)
    ) {
      return entry.isZeroPayout;
    }
    return true;
  }

  if (isPackageChangeTransaction(subscriptionType)) {
    return entry.isPackageChangeEligible;
  }

  // Spectra Renewal / Ownership Out: valid format is enough.
  return true;
};

/**
 * Credit existing package monthly back into allowance when renewing / changing
 * package onto a different package (Available already had the old package deducted).
 */
export const getRenewalPackageCredit = ({
  subscriptionType,
  msisdn,
  selectedPackageName,
  renewalMap,
}) => {
  if (!requiresListedMsisdn(subscriptionType)) return 0;
  const renewalContract = getRenewalContractForMsisdn(renewalMap, msisdn);
  if (!renewalContract) return 0;

  // Same package: waived via getBillable — no separate credit.
  if (
    selectedPackageName &&
    doesSelectedPackageMatchRenewalContract(
      selectedPackageName,
      renewalContract
    )
  ) {
    return 0;
  }

  // MSISDN selected (package pending or different): credit the existing amount.
  return Math.max(0, parseFloat(renewalContract.packageMonthly) || 0);
};

/**
 * Same package on listed MSISDN → waive package from allowance.
 */
export const isRenewalSamePackageWaived = ({
  subscriptionType,
  msisdn,
  selectedPackageName,
  renewalMap,
}) => {
  if (!requiresListedMsisdn(subscriptionType)) return false;
  const renewalContract = getRenewalContractForMsisdn(renewalMap, msisdn);
  if (!renewalContract || !selectedPackageName) return false;
  return doesSelectedPackageMatchRenewalContract(
    selectedPackageName,
    renewalContract
  );
};

/**
 * Billable package monthly against allowance.
 * - Same package renewal / package change: 0
 * - Different package: full new package price (caller adds credit to Available)
 * - Otherwise: full package price
 */
export const getBillableRenewalPackageMonthly = ({
  subscriptionType,
  msisdn,
  selectedPackageName,
  packageMonthly,
  renewalMap,
}) => {
  if (
    isRenewalSamePackageWaived({
      subscriptionType,
      msisdn,
      selectedPackageName,
      renewalMap,
    })
  ) {
    return 0;
  }
  return Math.max(0, parseFloat(packageMonthly) || 0);
};
