import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';

export class NotifierStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const notifierValidationFunction = new NodejsFunction(this, 'notifierValidationFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            functionName: 'notifierValidationFunction',
            description: 'A Lambda function to validate notifications',
            entry: 'lambda/notifier-validation.ts',
            handler: 'handler',
            environment: {
                SNS_TOPIC_ARN: 'something',
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
        });

        cdk.Tags.of(notifierValidationFunction).add('Project', 'Notifier');
        cdk.Tags.of(notifierValidationFunction).add('Environment', notifierValidationFunction.stack.stackName);
    }
}
