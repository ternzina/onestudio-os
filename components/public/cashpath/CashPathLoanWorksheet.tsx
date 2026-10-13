"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CASH_PATH_LOAN_WORKSHEET_PATH,
  equalPaymentTotal,
} from "@/lib/public-site/cashpath-loan-worksheet";
import styles from "./CashPathLoanWorksheet.module.css";

type Offer = {
  provider: string;
  offerDate: string;
  principal: string;
  netProceeds: string;
  apr: string;
  interestRate: string;
  rateType: string;
  upfrontFees: string;
  payment: string;
  paymentCount: string;
  totalRepayment: string;
  firstDue: string;
  lateFees: string;
  earlyPayoff: string;
  otherTerms: string;
};

type Field = {
  key: keyof Offer;
  label: string;
  hint?: string;
  placeholder?: string;
  numeric?: boolean;
};

const EMPTY_OFFER: Offer = {
  provider: "",
  offerDate: "",
  principal: "",
  netProceeds: "",
  apr: "",
  interestRate: "",
  rateType: "",
  upfrontFees: "",
  payment: "",
  paymentCount: "",
  totalRepayment: "",
  firstDue: "",
  lateFees: "",
  earlyPayoff: "",
  otherTerms: "",
};

const FIELD_GROUPS: Array<{ title: string; fields: Field[] }> = [
  {
    title: "Offer details",
    fields: [
      { key: "provider", label: "Lender or provider name" },
      { key: "offerDate", label: "Offer date / expiration" },
      { key: "principal", label: "Amount borrowed ($)", numeric: true },
      {
        key: "netProceeds",
        label: "Cash you actually receive ($)",
        hint: "After any amount withheld up front.",
        numeric: true,
      },
    ],
  },
  {
    title: "Rates, fees and payments",
    fields: [
      {
        key: "apr",
        label: "Disclosed APR (%)",
        hint: "Copy from the actual offer; do not estimate.",
        numeric: true,
      },
      { key: "interestRate", label: "Disclosed interest rate (%)", numeric: true },
      { key: "rateType", label: "Fixed or variable rate?" },
      { key: "upfrontFees", label: "Upfront fees and how they are charged ($)" },
      { key: "payment", label: "Scheduled payment ($)", numeric: true },
      {
        key: "paymentCount",
        label: "Number of equal payments",
        hint: "For example, 24 monthly payments.",
        numeric: true,
      },
      { key: "firstDue", label: "First due date / payment frequency" },
      { key: "totalRepayment", label: "Total repayment shown in disclosure ($)" },
    ],
  },
  {
    title: "Conditions to check",
    fields: [
      { key: "lateFees", label: "Late / returned-payment fees" },
      { key: "earlyPayoff", label: "Early-payoff terms or fees" },
      { key: "otherTerms", label: "Other conditions / questions" },
    ],
  },
];

const LETTERS = ["A", "B", "C"] as const;

function formatUS(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export default function CashPathLoanWorksheet() {
  const [offers, setOffers] = useState<Offer[]>(() =>
    LETTERS.map(() => ({ ...EMPTY_OFFER })),
  );
  const [includeThird, setIncludeThird] = useState(true);
  const visibleOffers = includeThird ? 3 : 2;
  const update = (offerIndex: number, key: keyof Offer, value: string) => {
    setOffers((previous) =>
      previous.map((offer, index) =>
        index === offerIndex ? { ...offer, [key]: value } : offer,
      ),
    );
  };

  return (
    <main className={styles.page}>
      <div className={styles.navigation}>
        <Link href="/" className={styles.logo} aria-label="CashPath home">
          Cash<span>Path</span>
        </Link>
        <nav aria-label="Site navigation">
          <Link href="/p/guides">Guides</Link>
          <Link href="/p/how-to-compare-personal-loan-offers">Comparison guide</Link>
        </nav>
      </div>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>Free financial education tool</p>
        <h1>Personal Loan Comparison Worksheet</h1>
        <p className={styles.lead}>
          Compare up to three written personal loan offers, side by side.
          Record what you will receive, what you must repay, and the conditions
          that matter before you decide.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.print()}
            className={styles.primaryButton}
          >
            Print or save as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setOffers(LETTERS.map(() => ({ ...EMPTY_OFFER })));
            }}
            className={styles.secondaryButton}
          >
            Clear worksheet
          </button>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={includeThird}
              onChange={(event) => setIncludeThird(event.target.checked)}
            />
            Compare three offers
          </label>
        </div>
        <p className={styles.privacy}>
          <strong>Your numbers stay in this browser.</strong> This worksheet does
          not save or submit your entries to CashPath. Avoid typing Social Security
          numbers, account numbers, or other sensitive personal details.
        </p>
      </section>

      <section className={styles.sheet} aria-labelledby="worksheet-heading">
        <div className={styles.sheetTitle}>
          <div>
            <p className={styles.eyebrow}>Worksheet</p>
            <h2 id="worksheet-heading">Compare the written terms</h2>
          </div>
          <p>
            Use each lender&apos;s current written disclosure, not an advertisement
            or a verbal estimate. Leave missing terms blank and ask questions.
          </p>
        </div>
        <div className={styles.scrollTable} role="region" aria-label="Loan offer comparison table" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.labelColumn}>What to compare</th>
                {LETTERS.slice(0, visibleOffers).map((letter) => (
                  <th key={letter} scope="col">Offer {letter}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELD_GROUPS.map((group) => (
                <FragmentRows
                  key={group.title}
                  group={group}
                  offers={offers}
                  visibleOffers={visibleOffers}
                  onUpdate={update}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.checks} aria-label="Equal payment arithmetic checks">
          <div className={styles.checkHeading}>
            <h3>Quick arithmetic check</h3>
            <p>
              If an offer calls for the same payment every time, multiply the
              scheduled amount by the number of payments. This is <strong>not</strong> an
              APR calculation or a replacement for the lender&apos;s disclosed total.
            </p>
          </div>
          <div className={styles.checkGrid}>
            {LETTERS.slice(0, visibleOffers).map((letter, index) => {
              const value = equalPaymentTotal(
                offers[index].payment,
                offers[index].paymentCount,
              );
              return (
                <div className={styles.checkCard} key={letter}>
                  <span>Offer {letter}: equal-payment total</span>
                  <strong>{value === null ? "Not calculated" : formatUS(value)}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.decisions}>
          <h3>Questions to ask before accepting an offer</h3>
          <ul>
            <li>How much money will I actually receive after upfront deductions?</li>
            <li>Can I afford the payment alongside rent, utilities, groceries and emergencies?</li>
            <li>What fees or conditions could change the amount I repay?</li>
            <li>Is the rate fixed or variable, and what happens if I pay early or late?</li>
            <li>Have I saved the final disclosure and repayment schedule?</li>
          </ul>
        </div>
      </section>

      <section className={styles.sources}>
        <h2>How to use this worksheet responsibly</h2>
        <p>
          APR, interest rate, fees, and repayment amount describe different parts
          of an offer. A lower APR does not automatically mean the monthly payment
          fits your budget. Some fees can affect the cash you receive or your
          overall cost. Compare actual written terms on a similar basis.
        </p>
        <p>
          Read the CashPath{" "}
          <Link href="/p/how-to-compare-personal-loan-offers">
            step-by-step loan comparison guide
          </Link>
          . For independent explanations, see the{" "}
          <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/" target="_blank" rel="noopener noreferrer">
            CFPB explanation of APR and interest rate
          </a>{" "}
          and{" "}
          <a href="https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/" target="_blank" rel="noopener noreferrer">
            CFPB guidance on personal-loan fees
          </a>
          .
        </p>
        <p className={styles.disclosure}>
          CashPath is an educational and advertising-supported referral website,
          not a lender. This free worksheet does not require a credit application.
          It does not provide individual financial or legal advice, verify an
          offer, determine eligibility, or promise any lending outcome. Financial
          terms and decisions are determined by the lender; always use the
          lender&apos;s final disclosures.
        </p>
        <div className={styles.footer}>
          <Link href="/p/guides">Browse CashPath guides</Link>
          <Link href="/p/advertiser-disclosure">Advertiser disclosure</Link>
          <span>{CASH_PATH_LOAN_WORKSHEET_PATH}</span>
        </div>
      </section>
    </main>
  );
}

function FragmentRows({
  group,
  offers,
  visibleOffers,
  onUpdate,
}: {
  group: { title: string; fields: Field[] };
  offers: Offer[];
  visibleOffers: number;
  onUpdate: (offerIndex: number, key: keyof Offer, value: string) => void;
}) {
  return (
    <>
      <tr className={styles.groupRow}>
        <th colSpan={visibleOffers + 1} scope="rowgroup">{group.title}</th>
      </tr>
      {group.fields.map((field) => (
        <tr key={field.key}>
          <th scope="row" className={styles.fieldLabel}>
            {field.label}
            {field.hint ? <span>{field.hint}</span> : null}
          </th>
          {LETTERS.slice(0, visibleOffers).map((letter, index) => (
            <td key={letter}>
              <input
                type="text"
                value={offers[index][field.key]}
                inputMode={field.numeric ? "decimal" : "text"}
                maxLength={120}
                placeholder={field.placeholder || "Enter from disclosure"}
                aria-label={field.label + ", Offer " + letter}
                autoComplete="off"
                onChange={(event) =>
                  onUpdate(index, field.key, event.target.value)
                }
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
