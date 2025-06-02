#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { NotifierStack } from "../lib/stacks";

const app = new cdk.App();

new NotifierStack(app, "NotifierStack");
