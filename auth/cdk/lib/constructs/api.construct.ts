import { Construct } from "constructs";
import {
  HttpApi,
  HttpMethod,
  DomainName,
  HttpStage,
  HttpRouteIntegrationConfig,
  HttpRoute,
  HttpRouteAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiConstructProps {
  signinFunction: IFunction;
  refreshTokenFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.authApi();
    this.createRoutes();

    this.customDomainMapping();
  }

  private authApi() {
    return new HttpApi(this, "api-auth-http", {
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
        allowMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.OPTIONS],
        allowOrigins: ["*"],
      },
    });
  }

  private createRoutes() {
    const signinIntegration = new HttpLambdaIntegration("signin-integration", this.props.signinFunction);
    const refreshIntegration = new HttpLambdaIntegration("refresh-integration", this.props.refreshTokenFunction);

    this.api.addRoutes({
      path: "/signin",
      methods: [HttpMethod.POST],
      integration: signinIntegration,
    });

    this.api.addRoutes({
      path: "/refresh",
      methods: [HttpMethod.POST],
      integration: refreshIntegration,
    });
  }

  private customDomainMapping() {
    const domainName = StringParameter.fromStringParameterName(
      this,
      "parameter-domain",
      "/api/domain-name-set"
    );

    const domainNameAlias = StringParameter.fromStringParameterName(
      this,
      "parameter-domain-alias",
      "/api/domain-name-alias"
    );

    const domainHostZoneId = StringParameter.fromStringParameterName(
      this,
      "parameter-domain-hosted-zone-id",
      "/api/domain-name-hosted-zone-id"
    );

    DomainName.fromDomainNameAttributes(this, "domain-name-attributes", {
      name: domainName.stringValue,
      regionalDomainName: domainNameAlias.stringValue,
      regionalHostedZoneId: domainHostZoneId.stringValue,
    });
  }
}
