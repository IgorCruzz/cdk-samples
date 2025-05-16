#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SheetParseStack } from "../lib/sheet-parse-stack";

const app = new cdk.App();
new SheetParseStack(app, "SheetParseStack");
