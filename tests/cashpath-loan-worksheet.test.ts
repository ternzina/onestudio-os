import assert from "node:assert/strict";
import test from "node:test";
import {
  equalPaymentTotal,
  CASH_PATH_LOAN_WORKSHEET_PATH,
} from "../lib/public-site/cashpath-loan-worksheet.ts";

test("cashpath worksheet URL stays stable", () => {
  assert.equal(CASH_PATH_LOAN_WORKSHEET_PATH, "/p/loan-comparison-worksheet");
});

test("equal installments give a rounded arithmetic check, not APR", () => {
  assert.equal(equalPaymentTotal("205.25", "24"), 4926);
  assert.equal(equalPaymentTotal("1,250.50", "12"), 15006);
  assert.equal(equalPaymentTotal("100", "1"), 100);
});

test("missing, nonnumeric or nonstandard schedules do not produce a misleading total", () => {
  for (const [payment, count] of [
    ["", "12"],
    ["120", ""],
    ["$120", "12"],
    ["-120", "12"],
    ["120", "0"],
    ["120", "601"],
    ["120", "12.5"],
    ["120.123", "12"],
  ]) {
    assert.equal(equalPaymentTotal(payment, count), null);
  }
});
