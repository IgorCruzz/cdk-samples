#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GlobalStack } from '../lib/global-stack';

const app = new cdk.App();
new GlobalStack(app, 'GlobalStack');
