#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CustomersStack } from "../lib/stacks/customers-stack";

const app = new cdk.App();
new CustomersStack(app, "stack-customers");
