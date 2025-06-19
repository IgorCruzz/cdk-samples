import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  LambdaIntegration,
  BasePathMapping,
  DomainName,
  UsagePlan,
  Period,
  ApiKey,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
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
    this.basePathMapping();
    this.usagePlan();
  }

  private usagePlan() {
    const usagePlan = new UsagePlan(this, "MeuUsagePlan", {
      description:
        "Permite 10 requisições por dia (aproximadamente equivalente a 10 em 10h)",
      throttle: {
        rateLimit: 1,
        burstLimit: 1,
      },
      quota: {
        limit: 10,
        period: Period.DAY,
      },
    });

    usagePlan.addApiStage({
      stage: this.api.deploymentStage,
    });

    const apiKey = ApiKey.fromApiKeyId(
      this,
      "api-key",
      StringParameter.fromStringParameterName(
        this,
        "parameter-api-key",
        "/api/api-key"
      ).stringValue
    );

    usagePlan.addApiKey(apiKey);
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
        allowMethods: ["OPTIONS", "POST"],
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
      {
        apiKeyRequired: true,
      }
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
}
