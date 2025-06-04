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
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";
import { ACMConstruct } from "./acm.construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Function } from "aws-cdk-lib/aws-lambda";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Route53Construct } from "./route53.construct";
import { RecordSet, RecordTarget, RecordType } from "aws-cdk-lib/aws-route53";
import { Duration } from "aws-cdk-lib";

type ApiConstructProps = {
  acm: ACMConstruct;
  route53: Route53Construct;
};

export class ApiConstruct extends Construct {
  public readonly xyzApi: RestApi;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: ApiConstructProps
  ) {
    super(scope, id);

    this.xyzApi = this.createXyzApi();

    this.createNotificationResource();
    this.createSheetParseResource();
  }

  private createXyzApi() {
    const xyzApi = new RestApi(this, "xyzApi", {
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
        certificate: this.props.acm.certificate,
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    const url = xyzApi.url.split("//")[1];

    new RecordSet(this, "ApiRecordSet", {
      recordType: RecordType.CNAME,
      target: RecordTarget.fromValues(url),
      zone: this.props.route53.hostedZone,
      ttl: Duration.seconds(300),
      recordName: "api",
    });

    const apiArn = xyzApi.arnForExecuteApi();

    new StringParameter(this, "apiArnParameter", {
      parameterName: "/apigateway/xyzApi",
      stringValue: apiArn,
    });

    return xyzApi;
  }

  private createNotificationResource() {
    const resource = this.xyzApi.root.addResource("notifications");

    const model = new Model(this, "NotificationsPostRequestModel", {
      restApi: this.xyzApi,
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
      "notificationsPostRequestValidator",
      {
        restApi: this.xyzApi,
        validateRequestBody: true,
      }
    );

    const notifierSendFunctionArn = StringParameter.fromStringParameterName(
      this,
      "notifierSendFunctionParameter",
      "/lambda/notifierSendFunction"
    );

    const fn = Function.fromFunctionAttributes(this, "notifierSendFunction", {
      functionArn: notifierSendFunctionArn.stringValue,
      sameEnvironment: true,
    });

    fn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));

    resource.addMethod("POST", new LambdaIntegration(fn), {
      requestModels: {
        "application/json": model,
      },
      requestValidator: validator,
    });
  }

  private createSheetParseResource() {
    const resource = this.xyzApi.root.addResource("generate");

    const fnArn = StringParameter.fromStringParameterName(
      this,
      "generatePreSignedUrlFunctionParameter",
      "/lambda/generatePreSignedUrlFunction"
    );

    const fn = Function.fromFunctionAttributes(
      this,
      "generatePreSignedUrlFunction",
      {
        functionArn: fnArn.stringValue,
        sameEnvironment: true,
      }
    );

    fn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));

    resource.addMethod("POST", new LambdaIntegration(fn), {});
  }
}
