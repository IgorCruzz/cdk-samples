#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CronJobStack } from "../lib/stacks/cron-job-stack";

const app = new cdk.App();
new CronJobStack(app, "stack-cron-job");
