export const AIRTIME_TRANSACTION_TYPES = [
  "New",
  "Renewal",
  "Package Change",
  "Ownership Transfer In",
  "Ownership Transfer Out",
];

export const normalizeAirtimeMsisdn = (value) =>
  String(value || "").replace(/\D/g, "");

export const isRenewalTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "renewal";

export const isPackageChangeTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "package change";

export const isOwnershipTransferTransaction = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return (
    normalized === "ownership transfer in" ||
    normalized === "ownership transfer out"
  );
};

/** Renewal, Package Change, and Ownership Transfer require an MSISDN. */
export const requiresListedMsisdn = (value) =>
  isRenewalTransaction(value) ||
  isPackageChangeTransaction(value) ||
  isOwnershipTransferTransaction(value);

/** Ownership transfers are package-only — no device / PMT required. */
export const isDeviceOptionalTransaction = (value) =>
  isOwnershipTransferTransaction(value);

export const isValidAirtimeMsisdn = (value) =>
  /^81\d{7}$/.test(normalizeAirtimeMsisdn(value));

export const isZeroOrNullDevicePrice = (value) => {
  if (value === null || value === undefined || value === "") return true;
  const parsed = Number(value);
  return !Number.isNaN(parsed) && parsed === 0;
};

export const AIRTIME_MSISDN_HELPER =
  "Select an MSISDN from your current contracts.";

export const PACKAGE_CHANGE_MSISDN_HELPER =
  "Package Change applies when the device on the selected MSISDN is free (N$ 0.00 or not set).";
