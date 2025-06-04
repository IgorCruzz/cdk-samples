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
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";

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

    new RecordSet(this, "ApiRecordSet", {
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(xyzApi.domainName!)),
      zone: this.props.route53.hostedZone,
      ttl: Duration.seconds(300),
      recordName: "api",
    });

    new StringParameter(this, "apiIdParameter", {
      parameterName: "/apigateway/xyzApiId",
      stringValue: xyzApi.restApiId,
    });

    new StringParameter(this, "apiResourceIdParameter", {
      parameterName: "/apigateway/xyzApiResourceId",
      stringValue: xyzApi.root.resourceId,
    });

    return xyzApi;
  }
}
