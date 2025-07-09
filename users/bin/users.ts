#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UsersStack } from '../lib/users-stack';

const app = new cdk.App();
new UsersStack(app, 'UsersStack');
