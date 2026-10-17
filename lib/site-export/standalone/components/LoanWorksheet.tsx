"use client";

import { useMemo, useState } from "react";

const FIELDS = ["Lender or provider name", "Amount borrowed ($)", "Cash you actually receive ($)", "Disclosed APR (%)", "Scheduled payment ($)", "Number of equal payments", "Total repayment shown in disclosure ($)"] as const;

function equalPaymentTotal(payment: string, numberOfPayments: string): number | null {
  const money = payment.trim().replaceAll(",", "");
  const count = numberOfPayments.trim();
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(money) || !/^\d{1,4}$/.test(count)) return null;
  const installment = Number(money);
  const installments = Number(count);
  if (!(installment > 0) || !Number.isSafeInteger(installments) || installments < 1 || installments > 600) return null;
  const result = Math.round((installment * installments + Number.EPSILON) * 100) / 100;
  return Number.isFinite(result) ? result : null;
}

export default function LoanWorksheet() {
  const [values, setValues] = useState<Record<string, string>>({});
  const totals = useMemo(() => [0, 1, 2].map((index) => equalPaymentTotal(values[`${index}:Scheduled payment ($)`] || "", values[`${index}:Number of equal payments`] || "")), [values]);
  return <main className="article worksheet">
    <header className="article-bar"><a className="brand" href="/">Cash<span>Path</span></a><nav><a href="/p/guides">Guides</a><a href="/p/how-to-compare-personal-loan-offers">Comparison guide</a></nav></header>
    <section className="article-hero">
      <p className="eyebrow">Free financial education tool</p>
      <h1>Personal Loan Comparison Worksheet</h1>
      <p>Compare up to three written personal loan offers, side by side. Record what you will receive, what you must repay, and the conditions that matter before you decide.</p>
      <p><strong>Your numbers stay in this browser.</strong> This worksheet does not save or submit your entries to CashPath. Avoid typing Social Security numbers, account numbers, or other sensitive personal details.</p>
      <button type="button" onClick={() => window.print()}>Print or save as PDF</button>
    </section>
    <section className="article-grid"><div /><article>
      <h2>Compare the written terms</h2>
      <p>Use each lender&apos;s current written disclosure, not an advertisement or a verbal estimate. If an offer calls for the same payment every time, the equal-payment total multiplies that amount by the number of payments. This is not an APR calculation.</p>
      <div className="cards">{[0, 1, 2].map((index) => <section key={index}><h3>Offer {String.fromCharCode(65 + index)}</h3>{FIELDS.map((label) => <label key={label} className="field">{label}<input value={values[`${index}:${label}`] || ""} onChange={(event) => setValues({ ...values, [`${index}:${label}`]: event.target.value })} /></label>)}<p>{totals[index] === null ? "Equal-payment total: Not calculated" : `Equal-payment total: $${totals[index]?.toFixed(2)}. This is not an APR calculation.`}</p></section>)}</div>
      <p>CashPath is an educational and advertising-supported referral website, not a lender. This worksheet does not require a credit application, verify an offer, or promise a lending outcome. Always verify terms with the provider&apos;s final written disclosures.</p>
    </article></section>
  </main>;
}
