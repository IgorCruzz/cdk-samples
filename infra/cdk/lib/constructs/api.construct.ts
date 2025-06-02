import { Construct } from "constructs";
import {
  RestApi,
  RequestValidator,
  Model,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  SecurityPolicy,
  AccessLogFormat,
  JsonSchemaType,
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class ApiConstruct extends Construct {
  public readonly xyzApi: RestApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.xyzApi = this.createXyzApi();

    this.createNotificationResource();
    this.createSheetParseResource();
  }

  private createXyzApi() {
    const certificate = StringParameter.fromStringParameterName(
      this,
      "notifierCertificateParameter",
      "/certs/notifier-api"
    );

    const xyzApi = new RestApi(this, "xyzApi", {
      restApiName: "XYZ API",
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },

      cloudWatchRole: true,
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        metricsEnabled: true,
        tracingEnabled: true,
        dataTraceEnabled: true,
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ["OPTIONS", "POST"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
      disableExecuteApiEndpoint: true,
      domainName: {
        domainName: "api.igorcruz.space",
        certificate: Certificate.fromCertificateArn(
          this,
          "notifierCertificate",
          certificate.stringValue
        ),
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    return xyzApi;
  }

  private createNotificationResource() {
    const resource = this.xyzApi.root.addResource("notifications");

    const model = new Model(this, "NotificationsPostRequestModel", {
      restApi: this.xyzApi,
      contentType: "application/json",
      modelName: "NotificationsPostRequestModel",
      description: "Model for notifications post request",
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
                service: {
                  type: JsonSchemaType.STRING,
                  enum: ["EMAIL", "WHATSAPP"],
                },
                title: {
                  type: JsonSchemaType.STRING,
                  minLength: 1,
                  maxLength: 100,
                },
                message: {
                  type: JsonSchemaType.STRING,
                  minLength: 1,
                  maxLength: 500,
                },
              },
              required: ["service", "message", "title"],
            },
          },
        },
        required: ["notifications"],
      },
    });

    const validator = new RequestValidator(
      this,
      "notificationsPostRequestValidator",
      {
        restApi: this.xyzApi,
        requestValidatorName: "notificationsPostRequestValidator",
        validateRequestBody: true,
      }
    );

    resource.addMethod("POST", new LambdaIntegration(notifierSendHandler), {
      requestModels: {
        "application/json": model,
      },
      requestValidator: validator,
    });
  }

  private createSheetParseResource() {
    this.xyzApi.root.addResource("generate");
  }
}
