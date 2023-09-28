import fs from "fs";

test("レポートが正しく出力されること", () => {
  const report = "report/summary.json";
  expect(fs.existsSync(report)).toBeTruthy();
  const summary = JSON.parse(fs.readFileSync(report, "utf-8"));
  expect(typeof summary.durationInMs).toStrictEqual("number");
  expect(summary.passed).toStrictEqual(["playwright.spec.ts:3:5"]);
  expect(summary.skipped).toStrictEqual(["playwright.spec.ts:10:6"]);
  expect(summary.failed).toStrictEqual(["playwright.spec.ts:17:5"]);
  expect(summary.warned).toStrictEqual([]);
  expect(summary.interrupted).toStrictEqual([]);
  expect(summary.timedOut).toStrictEqual(["playwright.spec.ts:24:5"]);
  expect(summary.status).toStrictEqual("failed");
  expect(typeof summary.startedAt).toStrictEqual("number");
  expect(summary.name).toStrictEqual("summary.json");
  expect(summary.outputFolder).toStrictEqual("report");
});
