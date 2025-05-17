import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  SecurityPolicy,
  Resource,
  AccessLogFormat,
  LogGroupLogDestination,
} from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy } from "aws-cdk-lib";

export class ApiConstruct extends Construct {
  public readonly sheetParseApi: RestApi;
  public readonly sheetParseResource: Resource;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { sheetParseApi, sheetParseResource } = this.createSheetParseApi();

    this.sheetParseApi = sheetParseApi;
    this.sheetParseResource = sheetParseResource;
  }

  private createSheetParseApi() {
    const certificate = StringParameter.fromStringParameterName(
      this,
      "sheetParseCertificateParameter",
      "/certs/notifier-api"
    );

    const logGroup = new LogGroup(this, "ApiLogs", {
      logGroupName: "/aws/apigateway/sheetParse-api",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const sheetParseApi = new RestApi(this, "sheetParseApi", {
      restApiName: "sheetParse API",
      description: "API for generate presigned URLs",
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
        accessLogDestination: new LogGroupLogDestination(logGroup),
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
        domainName: "generate.igorcruz.space",
        certificate: Certificate.fromCertificateArn(
          this,
          "notifierCertificate",
          certificate.stringValue
        ),
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    const sheetParseResource = sheetParseApi.root.addResource("generate");

    return {
      sheetParseApi,
      sheetParseResource,
    };
  }
}
