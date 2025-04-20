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

        const certificate = this.getCertificateArn();

        this.notifierApi = this.createNotifierApi({
            certificate,
        });

        this.notifierResource = this.notifierApi.root.addResource('notifications');

        this.notificationsPostRequestModel = this.createNotificationsPostRequestModel();

        this.notificationsPostRequestValidator = this.createNotificationsPostRequestValidator();
    }

    private getCertificateArn() {
        const parameter = StringParameter.fromStringParameterName(
            this,
            'notifierCertificateParameter',
            '/certs/notifier-api',
        );

        return parameter.stringValue;
    }

    private createNotifierApi({ certificate }: { certificate: string }) {
        return new RestApi(this, 'notifierApi', {
            restApiName: 'Notifier API',
            description: 'API for sending notifications',
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
                certificate: Certificate.fromCertificateArn(this, 'notifierCertificate', certificate),
                endpointType: EndpointType.REGIONAL,
                securityPolicy: SecurityPolicy.TLS_1_2,
            },
        });
    }

    private createNotificationsPostRequestModel() {
        return new Model(this, 'NotificationsPostRequestModel', {
            restApi: this.notifierApi,
            contentType: 'application/json',
            modelName: 'NotificationsPostRequestModel',
            description: 'Model for notifications post request',
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
    }

    private createNotificationsPostRequestValidator() {
        return new RequestValidator(this, 'notificationsPostRequestValidator', {
            restApi: this.notifierApi,
            requestValidatorName: 'notificationsPostRequestValidator',
            validateRequestBody: true,
        });
    }
}
