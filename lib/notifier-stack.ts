import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

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

        cdk.Tags.of(notifierApi).add('Project', 'Notifier');
        cdk.Tags.of(notifierApi).add('Environment', notifierApi.stack.stackName);

        const notifierResource = notifierApi.root.addResource('notifications');

        const notifierIntegration = new cdk.aws_apigateway.LambdaIntegration(notifierValidationFunction);

        const notificationsPostRequestModel = new cdk.aws_apigateway.Model(this, 'notificationsPostRequestModel', {
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

        const notificationsPostRequestValidator = new cdk.aws_apigateway.RequestValidator(
            this,
            'notificationsPostRequestValidator',
            {
                restApi: notifierApi,
                requestValidatorName: 'notificationsPostRequestValidator',
                validateRequestBody: true,
            },
        );

        notifierResource.addMethod('POST', notifierIntegration, {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });
    }
}
