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
    public notifierValidationFunction: NodejsFunction;
    public notiferProcessFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.validationFunction(props);
        this.processFunction(props);
    }

    validationFunction(props: LambdaStackProps) {
        const { notifierSNSTopic } = props.snsStack;
        const { notifierResource, notificationsPostRequestModel, notificationsPostRequestValidator } = props.apiStack;

        this.notifierValidationFunction = new NodejsFunction(this, 'notifierValidationFunction', {
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

        notifierSNSTopic.grantPublish(this.notifierValidationFunction);

        notifierResource.addMethod('POST', new LambdaIntegration(this.notifierValidationFunction), {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });
    }

    processFunction(props: LambdaStackProps) {
        const { notifierTable } = props.databaseStack;
        const { notifierHighPriorityQueue, notifierMediumPriorityQueue, notifierLowPriorityQueue } = props.sqsStack;

        this.notiferProcessFunction = new NodejsFunction(this, 'notifierProcessFunction', {
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

        this.notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierHighPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        this.notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierMediumPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        this.notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierLowPriorityQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notifierHighPriorityQueue.grantConsumeMessages(this.notiferProcessFunction);
        notifierMediumPriorityQueue.grantConsumeMessages(this.notiferProcessFunction);
        notifierLowPriorityQueue.grantConsumeMessages(this.notiferProcessFunction);
        notifierTable.grantWriteData(this.notiferProcessFunction);
    }
}
