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
  Model,
  JsonSchemaType,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiConstructProps {
  updateUserFunction: IFunction;
  createUserFunction: IFunction;
  getUsersFunction: IFunction;
  deleteUserFunction: IFunction;
}

export class ApiConstruct extends Construct {
  public readonly api: RestApi;
  private readonly paramsResource: any;

  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);

    this.api = this.userApi();
    this.paramsResource = this.paramResource();

    this.basePathMapping();
    this.usagePlan();
    this.createUserResouce();
    this.getUserResouce();
    this.updateUserResouce();
    this.deleteUserResouce();
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

  private userApi() {
    const xyzApi = new RestApi(this, "api-user", {
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
        allowMethods: ["OPTIONS", "POST", "GET", "PUT", "DELETE"],
        allowHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
      },
      disableExecuteApiEndpoint: true,
    });

    return xyzApi;
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

    new BasePathMapping(this, "user-mapping", {
      domainName: domain,
      restApi: this.api,
      basePath: "users",
    });
  }

  private createUserResouce() {
    const model = new Model(this, "model-user-request", {
      restApi: this.api,
      contentType: "application/json",
      description: "Model for user create request",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          name: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 100,
          },
          email: {
            type: JsonSchemaType.STRING,
            format: "email",
            minLength: 5,
            maxLength: 255,
          },
          password: {
            type: JsonSchemaType.STRING,
            minLength: 6,
            maxLength: 128,
          },
        },
        required: ["name", "email", "password"],
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
      new LambdaIntegration(this.props.createUserFunction),
      {
        requestModels: {
          "application/json": model,
        },
        apiKeyRequired: true,
        requestValidator: validator,
      }
    );
  }

  private getUserResouce() {
    this.api.root.addMethod(
      "GET",
      new LambdaIntegration(this.props.getUsersFunction),
      {
        apiKeyRequired: true,
      }
    );
  }

  private paramResource() {
    return this.api.root.addResource("{id}");
  }

  private updateUserResouce() {
    this.paramsResource.addMethod(
      "PUT",
      new LambdaIntegration(this.props.updateUserFunction),
      {
        apiKeyRequired: true,
      }
    );
  }

  private deleteUserResouce() {
    this.paramsResource.addMethod(
      "DELETE",
      new LambdaIntegration(this.props.deleteUserFunction),
      {
        apiKeyRequired: true,
      }
    );
  }
}
