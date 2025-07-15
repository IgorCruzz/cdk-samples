import { Construct } from "constructs";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  Cors,
  LambdaIntegration,
  Model,
  JsonSchemaType,
  RequestValidator,
  DomainName,
  BasePathMapping,
  UsagePlan,
  Period,
  ApiKey,
  TokenAuthorizer,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

interface ApiConstructProps {
  notificationFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: RestApi;
  private readonly authorizer: TokenAuthorizer;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.notificationApi();
    this.authorizer = this.authorizerService();
    this.notificationResouce();
    this.basePathMapping();
    this.usagePlan();
  }

  private usagePlan() {
    const usagePlan = new UsagePlan(this, "usage-plan", {
      description:
        "Permite 1000 requisições por dia (aproximadamente equivalente a 10 em 10h)",
      throttle: {
        rateLimit: 1,
        burstLimit: 1,
      },
      quota: {
        limit: 1000,
        period: Period.DAY,
      },
    });

    usagePlan.addApiStage({
      stage: this.api.deploymentStage,
    });

    const apiKey = new ApiKey(this, "api-key-notification", {
      apiKeyName: "api-key-notification",
      description: "API key for secure services",
      enabled: true,
    });

    usagePlan.addApiKey(apiKey);
  }

  private notificationApi() {
    const xyzApi = new RestApi(this, "api-notification", {
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

  private notificationResouce() {
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

    this.api.root.addMethod(
      "POST",
      new LambdaIntegration(this.props.notificationFunction),
      {
        requestModels: {
          "application/json": model,
        },
        requestValidator: validator,
        authorizer: this.authorizer,
        authorizationType: AuthorizationType.CUSTOM,
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
      basePath: "notifications",
    });
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
