import {
  isRenewalTransaction,
  isPackageChangeTransaction,
  isOwnershipTransferTransaction,
  requiresListedMsisdn,
  normalizeAirtimeMsisdn,
  isValidAirtimeMsisdn,
  isZeroOrNullDevicePrice,
} from "./airtimeMsisdn";

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

/**
 * Build MSISDN → active CDR contract map for renewal / package-change flows.
 * Prefers active status when duplicates exist.
 */
export const buildRenewalContractMap = (contracts = []) => {
  const map = new Map();

  (contracts || [])
    .filter((contract) => !contract?.isSubmission)
    .forEach((contract) => {
      const msisdn = normalizeAirtimeMsisdn(
        contract.msisdn || contract.MSISDN || contract.staff_msisdn
      );
      if (!isValidAirtimeMsisdn(msisdn)) return;

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

      const entry = {
        msisdn,
        packageName,
        packageMonthly,
        deviceInitialCost,
        isFreeDevice: isZeroOrNullDevicePrice(deviceInitialCost),
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
  return renewalMap.get(normalizeAirtimeMsisdn(msisdn)) || null;
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
 * - Package Change: only MSISDNs whose assigned device is 0.00 or null
 * - Renewal: MSISDNs with a billed device (price > 0)
 * - Ownership Transfer In/Out: all listed MSISDNs
 * - Other: none
 */
export const getMsisdnOptionsForTransactionType = (
  renewalMap,
  subscriptionType
) => {
  const entries = Array.from(renewalMap?.values?.() || []);

  if (isPackageChangeTransaction(subscriptionType)) {
    return entries.filter((entry) => entry.isFreeDevice);
  }

  if (isRenewalTransaction(subscriptionType)) {
    return entries.filter((entry) => !entry.isFreeDevice);
  }

  if (isOwnershipTransferTransaction(subscriptionType)) {
    return entries;
  }

  return [];
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
