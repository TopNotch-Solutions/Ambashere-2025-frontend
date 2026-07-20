export const formatMoney = (value, { includeSymbol = true } = {}) => {
  const formatted = Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol ? `N$ ${formatted}` : formatted;
};
