import { Construct } from "constructs";
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
  AccessLogFormat,
} from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
export class ApiConstruct extends Construct {
  public readonly xyzApi: RestApi;
  public readonly xyzResource: Resource;
  public readonly notificationsPostRequestModel: Model;
  public readonly notificationsPostRequestValidator: RequestValidator;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const {
      xyzApi,
      xyzResource,
      notificationsPostRequestModel,
      notificationsPostRequestValidator,
    } = this.createXyzApi();

    this.xyzApi = xyzApi;
    this.xyzResource = xyzResource;
    this.notificationsPostRequestModel = notificationsPostRequestModel;
    this.notificationsPostRequestValidator = notificationsPostRequestValidator;
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
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
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

    const xyzResource = xyzApi.root.addResource("notifications");

    const notificationsPostRequestModel = new Model(
      this,
      "NotificationsPostRequestModel",
      {
        restApi: xyzApi,
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
      }
    );

    const notificationsPostRequestValidator = new RequestValidator(
      this,
      "notificationsPostRequestValidator",
      {
        restApi: xyzApi,
        requestValidatorName: "notificationsPostRequestValidator",
        validateRequestBody: true,
      }
    );

    return {
      xyzApi,
      xyzResource,
      notificationsPostRequestModel,
      notificationsPostRequestValidator,
    };
  }
}
