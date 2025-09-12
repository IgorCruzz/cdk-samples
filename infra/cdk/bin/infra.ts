#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/stacks/infra-stack";
import { VpcStack } from "../lib/stacks/vpc-stack";
import { RdsConstruct } from "../lib/constructs/rds.construct";

const app = new cdk.App();

new VpcStack(app, "stack-vpc", {});

new InfraStack(app, "stack-infra", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new RdsConstruct(app, "rds-construct");
