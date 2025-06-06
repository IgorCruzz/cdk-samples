#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SheetParseStack } from "../lib/stacks/sheet-parse.stack";

const app = new cdk.App();
new SheetParseStack(app, "stack-sheet-parse");
