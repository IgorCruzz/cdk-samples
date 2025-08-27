#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CronJobStack } from '../lib/cron-job-stack';

const app = new cdk.App();
new CronJobStack(app, 'CronJobStack');
