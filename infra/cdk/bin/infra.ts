#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Route53Stack } from "../lib/stacks/route53.stack";
import { AcmStack } from "../lib/stacks/acm-stack";
import { ApiStack } from "../lib/stacks/api-stack";

const app = new cdk.App();

new Route53Stack(app, "Route53Stack");
new AcmStack(app, "AcmStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
new ApiStack(app, "ApiStack");
