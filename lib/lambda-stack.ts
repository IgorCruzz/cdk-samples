import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ApiStack } from './api-stack';
import { SNSStack } from './sns-stack';
import { DynamoStack } from './dynamo-stack';
import { SQSStack } from './sqs-stack';

interface LambdaStackProps extends StackProps {
    sqsStack: SQSStack;
    databaseStack: DynamoStack;
    snsStack: SNSStack;
    apiStack: ApiStack;
}

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.createValidationFunction(props);
        this.createProcessFunction(props);
        this.createDlqFunction(props);
    }

    private createValidationFunction(props: LambdaStackProps) {
        const { notifierSNSTopic } = props.snsStack;

        const { notifierResource, notificationsPostRequestModel, notificationsPostRequestValidator } = props.apiStack;

        const notifierValidationFunction = new NodejsFunction(this, 'notifierValidationFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notifierValidationFunction',
            description: 'A Lambda function to validate notifications',
            entry: 'lambda/notifier-validation.ts',
            handler: 'handler',
            environment: {
                SNS_TOPIC_ARN: notifierSNSTopic.topicArn,
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notifierSNSTopic.grantPublish(notifierValidationFunction);

        notifierResource.addMethod('POST', new LambdaIntegration(notifierValidationFunction), {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });

        return notifierValidationFunction;
    }

    private createProcessFunction(props: LambdaStackProps) {
        const { notifierTable } = props.databaseStack;
        const { notifierHighPriorityQueue, notifierMediumPriorityQueue, notifierLowPriorityQueue } = props.sqsStack;

        const notiferProcessFunction = new NodejsFunction(this, 'notifierProcessFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferProcessFunction',
            description: 'A Lambda function to process notifications',
            entry: 'lambda/notifier-process.ts',
            handler: 'handler',
            environment: {
                DYNAMODB_TABLE_NAME: notifierTable.tableName,
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierHighPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierMediumPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierLowPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notifierHighPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierMediumPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierLowPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierTable.grantWriteData(notiferProcessFunction);

        return notiferProcessFunction;
    }

    private createDlqFunction(props: LambdaStackProps) {
        const { notifierDLQ } = props.sqsStack;

        const notiferDlqFunction = new NodejsFunction(this, 'notiferDlqFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferDlqFunction',
            description: 'A Lambda function to process notifications from DLQ',
            entry: 'lambda/notify-process-dlq',
            handler: 'handler',
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notiferDlqFunction.addEventSource(
            new SqsEventSource(notifierDLQ, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notifierDLQ.grantConsumeMessages(notiferDlqFunction);
    }
}
