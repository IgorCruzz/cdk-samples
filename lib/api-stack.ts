import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    RestApi,
    RequestValidator,
    Model,
    EndpointType,
    MethodLoggingLevel,
    Cors,
    SecurityPolicy,
    JsonSchemaType,
    Resource,
} from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class ApiStack extends Stack {
    public readonly notifierApi: RestApi;
    public readonly notifierResource: Resource;
    public readonly notificationsPostRequestModel: Model;
    public readonly notificationsPostRequestValidator: RequestValidator;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const certificate = StringParameter.fromStringParameterName(this, 'notifierCertificate', '/certs/notifier-api');

        this.notifierApi = new RestApi(this, 'notifierApi', {
            restApiName: 'Notifier API',
            description: 'API for the Notifier service',
            endpointConfiguration: {
                types: [EndpointType.REGIONAL],
            },
            cloudWatchRole: true,
            deployOptions: {
                loggingLevel: MethodLoggingLevel.INFO,
                metricsEnabled: true,
                tracingEnabled: true,
                stageName: 'prod',
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: ['OPTIONS', 'POST'],
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
            },
            disableExecuteApiEndpoint: true,
            domainName: {
                domainName: 'api.igorcruz.space',
                certificate: Certificate.fromCertificateArn(this, 'notifierCertificate', certificate.stringValue),
                endpointType: EndpointType.REGIONAL,
                securityPolicy: SecurityPolicy.TLS_1_2,
            },
        });

        this.notifierResource = this.notifierApi.root.addResource('notifications');

        this.notificationsPostRequestModel = new Model(this, 'notificationsPostRequestModel', {
            restApi: this.notifierApi,
            contentType: 'application/json',
            modelName: 'notificationsPostRequestModel',
            description: 'Model for notifications POST request',
            schema: {
                type: JsonSchemaType.OBJECT,
                properties: {
                    notifications: {
                        type: JsonSchemaType.ARRAY,
                        minItems: 1,
                        maxItems: 15,
                        items: {
                            type: JsonSchemaType.OBJECT,
                            properties: {
                                priority: {
                                    type: JsonSchemaType.STRING,
                                    enum: ['HIGH', 'MEDIUM', 'LOW'],
                                },
                                title: { type: JsonSchemaType.STRING, minLength: 1, maxLength: 100 },
                                userId: { type: JsonSchemaType.STRING, format: 'uuid' },
                                message: {
                                    type: JsonSchemaType.STRING,
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

        this.notificationsPostRequestValidator = new RequestValidator(this, 'notificationsPostRequestValidator', {
            restApi: this.notifierApi,
            requestValidatorName: 'notificationsPostRequestValidator',
            validateRequestBody: true,
        });
    }
}
