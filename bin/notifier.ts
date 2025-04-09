#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NotifierStack } from '../lib/notifier-stack';

const app = new cdk.App();
new NotifierStack(app, 'NotifierStack', {});
