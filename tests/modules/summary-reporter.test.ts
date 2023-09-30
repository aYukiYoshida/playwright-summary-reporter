import fs from "fs";
import sr from "summary-reporter";

test("レポートが正しく出力されること", () => {
  const report = "report/summary.json";
  expect(fs.existsSync(report)).toBeTruthy();
  const summary = JSON.parse(fs.readFileSync(report, "utf-8"));
  expect(sr.isSummary(summary)).toBeTruthy();
  expect(summary.passed).toStrictEqual([
    "playwright.setup.js:3:5",
    "playwright.setup.ts:3:5",
    "playwright.spec.js:3:5",
    "playwright.spec.ts:3:5",
    "playwright.test.js:3:5",
    "playwright.test.ts:3:5",
  ]);
  expect(summary.skipped).toStrictEqual([
    "playwright.setup.js:10:6",
    "playwright.setup.ts:10:6",
    "playwright.spec.js:10:6",
    "playwright.spec.ts:10:6",
    "playwright.test.js:10:6",
    "playwright.test.ts:10:6",
  ]);
  expect(summary.failed).toStrictEqual([
    "playwright.setup.js:17:5",
    "playwright.setup.ts:17:5",
    "playwright.spec.js:17:5",
    "playwright.spec.ts:17:5",
    "playwright.test.js:17:5",
    "playwright.test.ts:17:5",
  ]);
  expect(summary.warned).toStrictEqual([]);
  expect(summary.interrupted).toStrictEqual([]);
  expect(summary.timedOut).toStrictEqual([
    "playwright.setup.js:24:5",
    "playwright.setup.ts:24:5",
    "playwright.spec.js:24:5",
    "playwright.spec.ts:24:5",
    "playwright.test.js:24:5",
    "playwright.test.ts:24:5",
  ]);
  expect(summary.status).toStrictEqual("failed");
});
