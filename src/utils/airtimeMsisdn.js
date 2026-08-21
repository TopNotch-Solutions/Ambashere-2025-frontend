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

export const isValidAirtimeMsisdn = (value) =>
  /^81\d{7}$/.test(normalizeAirtimeMsisdn(value));

export const AIRTIME_MSISDN_HELPER =
  "Required for Renewal. Select an MSISDN from your current contracts.";
