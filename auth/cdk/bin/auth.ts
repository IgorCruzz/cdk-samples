#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/stacks/auth-stack";

const app = new cdk.App();
new AuthStack(app, "stack-auth");
