import { Construct } from "constructs";
import {
  CorsHttpMethod,
  HttpApi,
  DomainName,
  EndpointType,
} from "aws-cdk-lib/aws-apigatewayv2";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HostedZone } from "aws-cdk-lib/aws-route53";

export class ApiConstruct extends Construct {
  public readonly api: HttpApi;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: { certificate: ICertificate }
  ) {
    super(scope, id);

    this.createApi();
  }

  private createApi() {
    const domainName = new DomainName(this, "domain-name", {
      domainName: "api.igorcruz.space",
      certificate: this.props.certificate,
      endpointType: EndpointType.REGIONAL,
    });

    const route53HostedZoneId = StringParameter.valueForStringParameter(
      this,
      "/route53/hosted-zone-id"
    );

    HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: route53HostedZoneId,
      zoneName: "igorcruz.space",
    });

    return new HttpApi(this, "http-api", {
      createDefaultStage: true,
      disableExecuteApiEndpoint: true,
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
      },
      defaultDomainMapping: {
        domainName,
        mappingKey: "v1",
      },
    });
  }
}
