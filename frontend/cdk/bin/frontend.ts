#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/stacks/frontend-stack";

const app = new cdk.App();
new FrontendStack(app, "FrontendStack");
