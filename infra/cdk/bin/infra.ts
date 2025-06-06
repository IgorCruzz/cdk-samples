#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/stacks/infra.stack";

const app = new cdk.App();

new ApiStack(app, "ApiStack");
