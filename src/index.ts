import fs from "fs";
import path from "path";
import {
  TestCase,
  TestResult,
  Reporter,
  FullResult,
} from "@playwright/test/reporter";

export interface Summary {
  durationInMs: number;
  passed: string[];
  skipped: string[];
  failed: string[];
  warned: string[];
  timedOut: string[];
  status: FullResult["status"] | "unknown" | "warned" | "skipped";
}

type SummaryReporterOptions = {
  name?: string;
  outputFolder?: string;
};

class SummaryReporter implements Reporter, Summary {
  durationInMs = -1;
  passed: string[] = [];
  skipped: string[] = [];
  failed: string[] = [];
  warned: string[] = [];
  interrupted: string[] = [];
  timedOut: string[] = [];
  status: Summary["status"] = "unknown";
  startedAt = 0;
  private name: string;
  private outputFolder: string;

  constructor(options: SummaryReporterOptions = {}) {
    this.name = options.name ? options.name : "summary.json";
    this.outputFolder = options.outputFolder ? options.outputFolder : "report";
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
      if (s.includes("spec.ts")) {
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
    else if (status === "skipped") this.skipped.push(z);
    else if (status === "failed") this.failed.push(z);
    else if (status === "timedOut") this.timedOut.push(z);
    else if (status === "interrupted") this.interrupted.push(z);
    else if (status === "warned") this.warned.push(z);
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

    fs.writeFileSync(
      path.join(this.outputFolder, this.name),
      JSON.stringify(this, null, "  "),
    );
  }
}

export default SummaryReporter;
