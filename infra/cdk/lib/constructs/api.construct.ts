import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  SecurityPolicy,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import {
  HostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from "aws-cdk-lib/aws-route53";
import { Duration } from "aws-cdk-lib";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createXyzApi();
  }

  private createXyzApi() {
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
      },
    });

    const hostedZoneArn = StringParameter.fromStringParameterName(
      this,
      "parameter-hosted-zone-id",
      "/route53/hosted-zone-id"
    );

    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      "hosted-zone",
      {
        hostedZoneId: hostedZoneArn.stringValue,
        zoneName: "igorcruz.space",
      }
    );

    new RecordSet(this, "record-set-api", {
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(xyzApi.domainName!)),
      zone: hostedZone,
      ttl: Duration.seconds(300),
      recordName: "api",
    });

    new StringParameter(this, "parameter-xyz-api-id", {
      parameterName: "/apigateway/xyz-api-id",
      stringValue: xyzApi.restApiId,
    });

    new StringParameter(this, "parameter-xyz-resource-id", {
      parameterName: "/apigateway/xyz-api-resource-id",
      stringValue: xyzApi.root.resourceId,
    });

    return xyzApi;
  }
}
