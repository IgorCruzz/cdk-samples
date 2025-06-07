import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  SecurityPolicy,
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiConstructProps {
  sheetParseFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.sheetParseApi();

    this.sheetParseResouce();
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
    });

    return xyzApi;
  }

  private sheetParseResouce() {
    const resource = this.api.root.addResource("generate");

    resource.addMethod(
      "POST",
      new LambdaIntegration(this.props.sheetParseFunction),
      {}
    );
  }
}
