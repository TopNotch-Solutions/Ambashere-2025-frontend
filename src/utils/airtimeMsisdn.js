export const AIRTIME_TRANSACTION_TYPES = [
  "New",
  "Renewal",
  "Package Change",
  "Ownership Transfer In",
  "Ownership Transfer Out",
];

/** Spectra Benefits: no package change / ownership transfers; Upgrade instead. */
export const SPECTRA_TRANSACTION_TYPES = ["New", "Renewal", "Upgrade"];

export const getTransactionTypesForMode = (packageMode = "airtime") =>
  packageMode === "spectra"
    ? SPECTRA_TRANSACTION_TYPES
    : AIRTIME_TRANSACTION_TYPES;

export const normalizeAirtimeMsisdn = (value) =>
  String(value || "").replace(/\D/g, "");

export const isRenewalTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "renewal";

export const isUpgradeTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "upgrade";

/** Upgrade uses the same allowance / MSISDN / waive rules as Renewal. */
export const isRenewalLikeTransaction = (value) =>
  isRenewalTransaction(value) || isUpgradeTransaction(value);

export const isPackageChangeTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "package change";

export const isOwnershipTransferInTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "ownership transfer in";

export const isOwnershipTransferOutTransaction = (value) =>
  String(value || "").trim().toLowerCase() === "ownership transfer out";

export const isOwnershipTransferTransaction = (value) =>
  isOwnershipTransferInTransaction(value) ||
  isOwnershipTransferOutTransaction(value);

/**
 * MSISDN must come from the user's current contracts list.
 * Ownership Transfer In is excluded — that number is typed in.
 */
export const requiresListedMsisdn = (value) =>
  isRenewalLikeTransaction(value) ||
  isPackageChangeTransaction(value) ||
  isOwnershipTransferOutTransaction(value);

/** Ownership Transfer In: user types the MSISDN being added to their contracts. */
export const requiresTypedMsisdn = (value) =>
  isOwnershipTransferInTransaction(value);

/** Any transaction that needs an MSISDN (listed or typed). */
export const requiresMsisdn = (value) =>
  requiresListedMsisdn(value) || requiresTypedMsisdn(value);

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

export const OWNERSHIP_TRANSFER_IN_MSISDN_HELPER =
  "Enter the MSISDN being transferred into your contracts (e.g. 81XXXXXXX).";
