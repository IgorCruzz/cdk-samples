#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Route53Stack } from "../lib/stacks/route53.stack";
import { AcmStack } from "../lib/stacks/acm-stack";
import { ApiStack } from "../lib/stacks/api-stack";

const app = new cdk.App();

new Route53Stack(app, "Route53Stack");

new AcmStack(app, "AcmStack");

new ApiStack(app, "ApiStack");
