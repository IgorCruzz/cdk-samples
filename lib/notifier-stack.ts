import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RestApi, RequestValidator, Model, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Topic, Subscription, SubscriptionFilter, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { TableV2, Billing } from 'aws-cdk-lib/aws-dynamodb';
import { ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class NotifierStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //SNS
        const notifierSNSTopic = new Topic(this, 'notifierSNS', {
            displayName: 'Notifier SNS Topic',
            topicName: 'notifierTopic',
            tracingConfig: cdk.aws_sns.TracingConfig.ACTIVE,
        });

        //SQS
        const notifierHighPriorityQueue = new Queue(this, 'notifierHighPriorityQueue', {
            queueName: 'notifierHighPriorityQueue',
            visibilityTimeout: cdk.Duration.seconds(30),
            retentionPeriod: cdk.Duration.days(1),
        });

        const notifierMediumPriorityQueue = new Queue(this, 'notifierMediumPriorityQueue', {
            queueName: 'notifierMediumPriorityQueue',
            visibilityTimeout: cdk.Duration.seconds(30),
            retentionPeriod: cdk.Duration.days(1),
        });

        const notifierLowPriorityQueue = new Queue(this, 'notifierLowPriorityQueue', {
            queueName: 'notifierLowPriorityQueue',
            visibilityTimeout: cdk.Duration.seconds(30),
            retentionPeriod: cdk.Duration.days(1),
        });

        notifierHighPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [notifierHighPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: cdk.aws_iam.Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        notifierMediumPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [notifierMediumPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: cdk.aws_iam.Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        notifierLowPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [notifierLowPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: cdk.aws_iam.Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        new Subscription(this, 'highPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: notifierHighPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['HIGH'],
                }),
            },
        });

        new Subscription(this, 'mediumPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: notifierMediumPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['MEDIUM'],
                }),
            },
        });

        new Subscription(this, 'lowPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: notifierLowPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['LOW'],
                }),
            },
        });

        //LAMBDA
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
                SNS_TOPIC_ARN: notifierSNSTopic.topicArn,
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

        notifierSNSTopic.grantPublish(notifierValidationFunction);

        const notifierTable = new TableV2(this, 'notifierTable', {
            tableName: 'notifierTable',
            partitionKey: { name: 'PK', type: cdk.aws_dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: cdk.aws_dynamodb.AttributeType.STRING },
            globalSecondaryIndexes: [
                {
                    indexName: 'GSI1',
                    partitionKey: { name: 'GSI1PK', type: cdk.aws_dynamodb.AttributeType.STRING },
                    sortKey: { name: 'GSI1SK', type: cdk.aws_dynamodb.AttributeType.STRING },
                    projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
                },
            ],
            billing: Billing.onDemand(),
            tags: [
                { key: 'Project', value: 'Notifier' },
                { key: 'Environment', value: 'Notifier' },
            ],
        });

        const notiferProcessFunction = new NodejsFunction(this, 'notifierProcessFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
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
            logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
        });

        notifierHighPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierMediumPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierLowPriorityQueue.grantConsumeMessages(notiferProcessFunction);
        notifierTable.grantWriteData(notiferProcessFunction);

        notiferProcessFunction.addEventSource(
            new cdk.aws_lambda_event_sources.SqsEventSource(notifierHighPriorityQueue, {
                batchSize: 10,
            }),
        );

        notiferProcessFunction.addEventSource(
            new cdk.aws_lambda_event_sources.SqsEventSource(notifierMediumPriorityQueue, {
                batchSize: 10,
            }),
        );

        notiferProcessFunction.addEventSource(
            new cdk.aws_lambda_event_sources.SqsEventSource(notifierLowPriorityQueue, {
                batchSize: 10,
            }),
        );

        //API GATEWAY
        const notifierApi = new RestApi(this, 'notifierApi', {
            restApiName: 'Notifier API',
            description: 'API for the Notifier service',
            endpointConfiguration: {
                types: [cdk.aws_apigateway.EndpointType.REGIONAL],
            },
            cloudWatchRole: true,
            deployOptions: {
                loggingLevel: cdk.aws_apigateway.MethodLoggingLevel.INFO,
                metricsEnabled: true,
                tracingEnabled: true,
                stageName: 'prod',
            },
            defaultCorsPreflightOptions: {
                allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
                allowMethods: ['OPTIONS', 'POST'],
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
            },
        });

        const notifierResource = notifierApi.root.addResource('notifications');

        const notifierIntegration = new LambdaIntegration(notifierValidationFunction);

        const notificationsPostRequestModel = new Model(this, 'notificationsPostRequestModel', {
            restApi: notifierApi,
            contentType: 'application/json',
            modelName: 'notificationsPostRequestModel',
            description: 'Model for notifications POST request',
            schema: {
                type: cdk.aws_apigateway.JsonSchemaType.OBJECT,
                properties: {
                    notifications: {
                        type: cdk.aws_apigateway.JsonSchemaType.ARRAY,
                        minItems: 1,
                        maxItems: 15,
                        items: {
                            type: cdk.aws_apigateway.JsonSchemaType.OBJECT,
                            properties: {
                                priority: {
                                    type: cdk.aws_apigateway.JsonSchemaType.STRING,
                                    enum: ['HIGH', 'MEDIUM', 'LOW'],
                                },
                                title: { type: cdk.aws_apigateway.JsonSchemaType.STRING, minLength: 1, maxLength: 100 },
                                userId: { type: cdk.aws_apigateway.JsonSchemaType.STRING, format: 'uuid' },
                                message: {
                                    type: cdk.aws_apigateway.JsonSchemaType.STRING,
                                    minLength: 1,
                                    maxLength: 500,
                                },
                            },
                            required: ['priority', 'message', 'title', 'userId'],
                        },
                    },
                },
                required: ['notifications'],
            },
        });

        const notificationsPostRequestValidator = new RequestValidator(this, 'notificationsPostRequestValidator', {
            restApi: notifierApi,
            requestValidatorName: 'notificationsPostRequestValidator',
            validateRequestBody: true,
        });

        notifierResource.addMethod('POST', notifierIntegration, {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });

        cdk.Tags.of(notifierSNSTopic).add('Project', 'Notifier');
        cdk.Tags.of(notifierSNSTopic).add('Environment', notifierSNSTopic.stack.stackName);
        cdk.Tags.of(notifierValidationFunction).add('Project', 'Notifier');
        cdk.Tags.of(notifierValidationFunction).add('Environment', notifierValidationFunction.stack.stackName);
        cdk.Tags.of(notifierApi).add('Project', 'Notifier');
        cdk.Tags.of(notifierApi).add('Environment', notifierApi.stack.stackName);
    }
}
