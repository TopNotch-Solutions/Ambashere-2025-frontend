/** User/admin label for the Spectra account field (stored as msisdn). */
export const SPECTRA_ACCOUNT_NUMBER_LABEL = "Spectra Account Number";

/** Spectra accounts are free-form (not MSISDN / not 81…). */
export function normalizeSpectraAccountNumber(value) {
  return String(value || "").trim();
}

export function isValidSpectraAccountNumber(value) {
  return normalizeSpectraAccountNumber(value).length > 0;
}

/**
 * Spectra packages: names starting with "Spectra" (e.g. "Spectra 5(12)")
 * or containing "Spectra" (e.g. "Upgrade Spectra").
 */
export function isSpectraPackage(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  return (
    normalized.startsWith("spectra") ||
    normalized.startsWith("upgrade spectra") ||
    /\bspectra\b/.test(normalized)
  );
}

/** Packages whose name starts with "Upgrade" (e.g. "Upgrade Spectra …"). */
export function isUpgradeNamedPackage(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .startsWith("upgrade");
}

/**
 * New / Renewal must not use Upgrade-named packages.
 * Upgrade transaction type may use them.
 */
export function isSpectraPackageAllowedForTransaction(
  packageName,
  subscriptionType
) {
  const type = String(subscriptionType || "")
    .trim()
    .toLowerCase();
  if (type === "new" || type === "renewal") {
    return !isUpgradeNamedPackage(packageName);
  }
  return true;
}

export const SPECTRA_UPGRADE_PACKAGE_BLOCKED_MESSAGE =
  "Upgrade packages cannot be used with New or Renewal. Change the transaction type to Upgrade, or select a different package.";

export function getContractPackageName(contract) {
  return (
    contract?.PackageName ||
    contract?.package ||
    contract?.DisplayName ||
    ""
  );
}

export function filterPackagesByMode(packages, packageMode = "airtime") {
  const list = Array.isArray(packages) ? packages : [];
  if (packageMode === "spectra") {
    return list.filter((pkg) => isSpectraPackage(pkg?.PackageName));
  }
  // Default airtime: exclude Spectra from the airtime package list.
  return list.filter((pkg) => !isSpectraPackage(pkg?.PackageName));
}

export function filterContractsByMode(contracts, packageMode = "airtime") {
  const list = Array.isArray(contracts) ? contracts : [];
  if (packageMode === "spectra") {
    return list.filter((c) => isSpectraPackage(getContractPackageName(c)));
  }
  return list.filter((c) => !isSpectraPackage(getContractPackageName(c)));
}
