#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CsvParseStack } from "../lib/stacks/sheet-parse.stack";

const app = new cdk.App();
new CsvParseStack(app, "stack-sheet-parse", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
