/**
 * Arithmetic cross-check for equal scheduled installments only.
 * This is not a loan quote, an APR calculation, or a payment estimate.
 * Consumers should compare against the lender's written schedule.
 */
export function equalPaymentTotal(
  payment: string,
  numberOfPayments: string,
): number | null {
  const money = payment.trim().replaceAll(",", "");
  const count = numberOfPayments.trim();
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(money)) return null;
  if (!/^\d{1,4}$/.test(count)) return null;

  const installment = Number(money);
  const installments = Number(count);
  if (!Number.isFinite(installment) || installment <= 0) return null;
  if (!Number.isSafeInteger(installments) || installments < 1 || installments > 600) {
    return null;
  }

  const result = Math.round((installment * installments + Number.EPSILON) * 100) / 100;
  return Number.isFinite(result) ? result : null;
}

export const CASH_PATH_LOAN_WORKSHEET_PATH = "/p/loan-comparison-worksheet";
