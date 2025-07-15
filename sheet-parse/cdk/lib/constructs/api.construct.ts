import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  LambdaIntegration,
  BasePathMapping,
  DomainName,
  TokenAuthorizer,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

interface ApiConstructProps {
  sheetParseFunction: IFunction;
  getFilesDataFunction: IFunction;
  getStatisticDataFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: RestApi;
  private readonly authorizer: TokenAuthorizer;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.sheetParseApi();
    this.authorizer = this.authorizerService();
    this.sheetParseResouce();
    this.basePathMapping();
    this.getFilesDataResouce();
    this.getStatisticDataResouce();
  }

  private sheetParseApi() {
    const xyzApi = new RestApi(this, "api-sheet-parse", {
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
        allowMethods: ["OPTIONS", "POST", "GET"],
        allowHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
      },
      disableExecuteApiEndpoint: true,
    });

    return xyzApi;
  }

  private sheetParseResouce() {
    this.api.root.addMethod(
      "POST",
      new LambdaIntegration(this.props.sheetParseFunction),
      {}
    );
  }

  private basePathMapping() {
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

    const domain = DomainName.fromDomainNameAttributes(
      this,
      "domain-name-attributes",
      {
        domainName: domainName.stringValue,
        domainNameAliasTarget: domainNameAlias.stringValue,
        domainNameAliasHostedZoneId: domainHostZoneId.stringValue,
      }
    );

    new BasePathMapping(this, "sheet-parse-mapping", {
      domainName: domain,
      restApi: this.api,
      basePath: "files",
    });
  }

  private getFilesDataResouce() {
    this.api.root.addMethod(
      "GET",
      new LambdaIntegration(this.props.getFilesDataFunction),
      {
        authorizer: this.authorizer,
        authorizationType: AuthorizationType.CUSTOM,
      }
    );
  }

  private getStatisticDataResouce() {
    const resource = this.api.root.addResource("statistics");

    resource.addMethod(
      "GET",
      new LambdaIntegration(this.props.getStatisticDataFunction),
      {
        authorizer: this.authorizer,
        authorizationType: AuthorizationType.CUSTOM,
      }
    );
  }

  private authorizerService() {
    const fnParameter = StringParameter.fromStringParameterName(
      this,
      "parameter-authorizer-function",
      "/auth/authorizer/function/arn"
    );

    const authorizerFn = NodejsFunction.fromFunctionAttributes(
      this,
      "function-authorizer",
      {
        functionArn: fnParameter.stringValue,
        sameEnvironment: true,
      }
    );

    const tokenAuthorizer = new TokenAuthorizer(this, "authorizer-token", {
      handler: authorizerFn,
      identitySource: "method.request.header.Authorization",
    });

    authorizerFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));

    return tokenAuthorizer;
  }
}
