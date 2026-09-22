import {
  isRenewalTransaction,
  normalizeAirtimeMsisdn,
  isValidAirtimeMsisdn,
} from "./airtimeMsisdn";

export const normalizePackageName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/**
 * Build MSISDN → active CDR contract map for renewal flows.
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

      const entry = {
        msisdn,
        packageName,
        packageMonthly,
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
 * Credit existing package monthly back into allowance when renewing onto a
 * different package (Available already had the old package deducted).
 */
export const getRenewalPackageCredit = ({
  subscriptionType,
  msisdn,
  selectedPackageName,
  renewalMap,
}) => {
  if (!isRenewalTransaction(subscriptionType)) return 0;
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
  if (!isRenewalTransaction(subscriptionType)) return false;
  const renewalContract = getRenewalContractForMsisdn(renewalMap, msisdn);
  if (!renewalContract || !selectedPackageName) return false;
  return doesSelectedPackageMatchRenewalContract(
    selectedPackageName,
    renewalContract
  );
};

/**
 * Billable package monthly against allowance.
 * - Same package renewal: 0
 * - Different package renewal: full new package price (caller adds credit to Available)
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
