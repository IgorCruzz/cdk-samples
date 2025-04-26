import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ApiConstruct } from './api.construct';
import { SNSConstruct } from './sns.construct';
import { DynamoConstruct } from './dynamo.construct';
import { SQSConstruct } from './sqs.construct';

interface LambdaStackProps {
    sqsConstruct: SQSConstruct;
    dynamoConstruct: DynamoConstruct;
    snsConstruct: SNSConstruct;
    apiConstruct: ApiConstruct;
}

export class LambdaConstruct extends Construct {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id);

        this.createSendFunction(props);
        this.createProcessFunction(props);
        this.createDlqFunction(props);
    }

    private createSendFunction(props: LambdaStackProps) {
        const { notifierSNSTopic } = props.snsConstruct;

        const { notifierResource, notificationsPostRequestModel, notificationsPostRequestValidator } =
            props.apiConstruct;

        const notifierSendHandler = new NodejsFunction(this, 'notifierSendHandler', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notifierSendHandler',
            description: 'A Lambda function to send notifications',
            entry: 'lambda/handlers/index.ts',
            handler: 'notifierSendHandler',
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

        notifierSNSTopic.grantPublish(notifierSendHandler);

        notifierResource.addMethod('POST', new LambdaIntegration(notifierSendHandler), {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });

        return notifierSendHandler;
    }

    private createProcessFunction(props: LambdaStackProps) {
        const { notifierTable } = props.dynamoConstruct;
        const { notifierHighPriorityQueue, notifierMediumPriorityQueue, notifierLowPriorityQueue } = props.sqsConstruct;

        const notiferProcessFunction = new NodejsFunction(this, 'notifierProcessFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferProcessFunction',
            description: 'A Lambda function to process notifications',
            entry: 'lambda/handlers/index.ts',
            handler: 'notifierProcessHandler',
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
        const { notifierDLQ } = props.sqsConstruct;

        const notiferDlqFunction = new NodejsFunction(this, 'notiferDlqFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferDlqFunction',
            description: 'A Lambda function to process notifications from DLQ',
            entry: 'lambda/handlers/index.ts',
            handler: 'notifierProcessDLQHandler',
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
            }),
        );

        notifierDLQ.grantConsumeMessages(notiferDlqFunction);
    }
}
