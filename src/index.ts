import fs from "fs";
import path from "path";
import z from "zod";
import {
  TestCase,
  TestResult,
  Reporter,
  FullResult,
} from "@playwright/test/reporter";

const summarySchema = z.object({
  startedAt: z.number(),
  durationInMs: z.number(),
  passed: z.array(z.string()),
  skipped: z.array(z.string()),
  failed: z.array(z.string()),
  warned: z.array(z.string()),
  interrupted: z.array(z.string()),
  timedOut: z.array(z.string()),
  status: z.union([
    z.literal("passed"),
    z.literal("failed"),
    z.literal("timedout"),
    z.literal("interrupted"),
    z.literal("unknown"),
    z.literal("warned"),
    z.literal("skipped"),
  ]),
});

type Summary = z.infer<typeof summarySchema>;

type SummaryReporterOptions = {
  name?: string;
  outputFolder?: string;
  testMatch?: RegExp;
};

class SummaryReporter implements Reporter, Summary {
  startedAt = 0;
  durationInMs = -1;
  passed: string[] = [];
  skipped: string[] = [];
  failed: string[] = [];
  warned: string[] = [];
  interrupted: string[] = [];
  timedOut: string[] = [];
  status: Summary["status"] = "unknown";
  private name: string;
  private outputFolder: string;
  private testMatch: RegExp;

  constructor(options: SummaryReporterOptions = {}) {
    this.name = options.name ? options.name : "summary.json";
    this.outputFolder = options.outputFolder ? options.outputFolder : "report";
    this.testMatch = options.testMatch
      ? options.testMatch
      : /.*\.(spec|test|setup)\.(j|t|mj)s/;
  }

  onBegin() {
    this.startedAt = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const title = [];
    const fileName = [];
    let clean = true;
    for (const s of test.titlePath()) {
      if (s === "" && clean) continue;
      clean = false;
      title.push(s);
      if (this.testMatch.test(s)) {
        fileName.push(s);
      }
    }

    // This will publish the file name + line number test begins on
    const z = `${fileName[0]}:${test.location.line}:${test.location.column}`;

    // Using the t variable in the push will push a full test test name + test description
    const t = title.join(" > ");

    const status =
      !["passed", "skipped"].includes(result.status) && t.includes("@warn")
        ? "warned"
        : result.status;
    if (status === "passed") this.passed.push(z);
    else if (status === "failed") this.failed.push(z);
    else if (status === "timedOut") this.timedOut.push(z);
    else if (status === "interrupted") this.interrupted.push(z);
    else if (status === "warned") this.warned.push(z);
    else if (status === "skipped") this.skipped.push(z);
    else throw new Error(`Unexpected status: ${status}`);
  }

  onEnd(result: FullResult) {
    this.durationInMs = Date.now() - this.startedAt;
    this.status = result.status;

    // removing duplicate tests from passed array
    this.passed = this.passed.filter((element, index) => {
      return this.passed.indexOf(element) === index;
    });

    // removing duplicate and flakey (passed on a retry) tests from the failed array
    this.failed = this.failed.filter((element, index) => {
      if (!this.passed.includes(element))
        return this.failed.indexOf(element) === index;
    });

    const summary: Summary = {
      startedAt: this.startedAt,
      durationInMs: this.durationInMs,
      passed: this.passed,
      skipped: this.skipped,
      failed: this.failed,
      warned: this.warned,
      interrupted: this.interrupted,
      timedOut: this.timedOut,
      status: this.status,
    };
    if (!fs.existsSync(this.outputFolder)) fs.mkdirSync(this.outputFolder);
    fs.writeFileSync(
      path.join(this.outputFolder, this.name),
      JSON.stringify(summary, null, 2),
    );
  }

  public static isSummary(obj: unknown): obj is Summary {
    return summarySchema.safeParse(obj).success;
  }
}

export default SummaryReporter;
