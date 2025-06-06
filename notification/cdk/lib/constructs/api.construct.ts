import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  SecurityPolicy,
  LambdaIntegration,
  Model,
  JsonSchemaType,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiConstructProps {
  notificationFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.sheetParseApi();

    this.notificationResouce();
  }

  private sheetParseApi() {
    const certificateArn = StringParameter.fromStringParameterName(
      this,
      "parameter-certificate-arn",
      "/acm/certificate-arn"
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      "certificate-arn",
      certificateArn.stringValue
    );

    const xyzApi = new RestApi(this, "api-xyz", {
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },

      cloudWatchRole: true,
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        metricsEnabled: true,
        tracingEnabled: true,
        dataTraceEnabled: true,
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
        certificate,
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
        basePath: "notification",
      },
    });
    return xyzApi;
  }

  private notificationResouce() {
    const resource = this.api.root.addResource("notifications");

    const model = new Model(this, "model-notifications-post-request", {
      restApi: this.api,
      contentType: "application/json",
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
      "notifications-Post-request-validator",
      {
        restApi: this.api,
        validateRequestBody: true,
      }
    );

    resource.addMethod(
      "POST",
      new LambdaIntegration(this.props.notificationFunction),
      {
        requestModels: {
          "application/json": model,
        },
        requestValidator: validator,
      }
    );
  }
}
