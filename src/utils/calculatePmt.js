const ANNUAL_RATE = 0.1; // 10%

/**
 * Fixed monthly payment (PMT) for a financed amount.
 * PMT = (P * r) / (1 - (1 + r)^(-n))
 *
 * @param {number} principal - Loan amount (cdrlive / device amount)
 * @param {number} months - Term in months (user-selected package duration)
 * @param {number} [annualRate=0.1] - Annual interest rate as decimal
 * @returns {number} Monthly payment rounded to 2 decimal places
 */
export const calculatePmt = (
  principal,
  months,
  annualRate = ANNUAL_RATE
) => {
  const P = Number(principal) || 0;
  const n = Math.trunc(Number(months) || 0);

  if (P <= 0 || n <= 0) return 0;

  // Step 1: monthly interest rate, 8 decimal places
  const r = Number((annualRate / 12).toFixed(8));

  // Step 2: numerator (r * P), 6 decimal places
  const numerator = Number((r * P).toFixed(6));

  // Step 3: denominator
  const onePlusRPowNegN = Number(Math.pow(1 + r, -n).toFixed(8));
  const denominator = Number((1 - onePlusRPowNegN).toFixed(8));

  if (denominator === 0) return 0;

  // Step 4–5: unrounded payment, then round to 2 decimals
  const unrounded = numerator / denominator;
  return Number(unrounded.toFixed(2));
};

export const AIRTIME_DEVICE_ANNUAL_RATE = ANNUAL_RATE;
