#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { DatabaseStack } from '../lib/database-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { SNSStack } from '../lib/sns-stack';
import { SQSStack } from '../lib/sqs-stack';

const app = new cdk.App();

const apiStack = new ApiStack(app, 'ApiStack', {});
const databaseStack = new DatabaseStack(app, 'DatabaseStack', {});
const snsStack = new SNSStack(app, 'SnsStack', {});
const sqsStack = new SQSStack(app, 'SqsStack', {
    snsStack,
});
new LambdaStack(app, 'LambdaStack', {
    sqsStack,
    databaseStack,
    snsStack,
    apiStack,
});
