import { Construct } from "constructs";
import {
  CorsHttpMethod,
  HttpApi,
  DomainName,
  EndpointType,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class ApiConstruct extends Construct {
  public readonly api: HttpApi;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: { certificate: ICertificate }
  ) {
    super(scope, id);

    this.api = this.createApi();
    this.createUserResource();
    this.createAuthResource();
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

  private createUserResource() {
    const createUserArn = StringParameter.fromStringParameterName(
      this,
      "create-user-function-arn",
      "/lambda/create-user-function-arn"
    );

    const createUserFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-create-user",
      createUserArn.stringValue
    );

    const getUsersArn = StringParameter.fromStringParameterName(
      this,
      "get-users-function-arn",
      "/lambda/get-users-function-arn"
    );

    const getUsersFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-get-users",
      getUsersArn.stringValue
    );

    const updateUserArn = StringParameter.fromStringParameterName(
      this,
      "update-user-function-arn",
      "/lambda/update-user-function-arn"
    );

    const updateUserFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-update-user",
      updateUserArn.stringValue
    );

    const deleteUserArn = StringParameter.fromStringParameterName(
      this,
      "delete-user-function-arn",
      "/lambda/delete-user-function-arn"
    );

    const deleteUserFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-delete-user",
      deleteUserArn.stringValue
    );

    this.api.addRoutes({
      path: "/v1/users/{id}",
      integration: new HttpLambdaIntegration(
        "integration-delete-user",
        deleteUserFn
      ),
      methods: [HttpMethod.DELETE],
    });

    this.api.addRoutes({
      path: "/v1/users/{id}",
      integration: new HttpLambdaIntegration(
        "integration-update-user",
        updateUserFn
      ),
      methods: [HttpMethod.PUT],
    });

    this.api.addRoutes({
      path: "/v1/users",
      integration: new HttpLambdaIntegration(
        "integration-get-users",
        getUsersFn
      ),
      methods: [HttpMethod.GET],
    });

    this.api.addRoutes({
      path: "/v1/users",
      integration: new HttpLambdaIntegration(
        "integration-create-user",
        createUserFn
      ),
      methods: [HttpMethod.POST],
    });
  }

  private createAuthResource() {
    const signinArn = StringParameter.fromStringParameterName(
      this,
      "signin-function-arn",
      "/auth/signin/function/arn"
    );

    const signinFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-signin",
      signinArn.stringValue
    );

    const refreshTokenArn = StringParameter.fromStringParameterName(
      this,
      "refresh-token-function-arn",
      "/auth/refresh-token/function/arn"
    );

    const refreshTokenFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-refresh-token",
      refreshTokenArn.stringValue
    );

    this.api.addRoutes({
      path: "/v1/auth/signin",
      integration: new HttpLambdaIntegration("integration-signin", signinFn),
      methods: [HttpMethod.POST],
    });

    this.api.addRoutes({
      path: "/v1/auth/refresh-token",
      integration: new HttpLambdaIntegration(
        "integration-refresh-token",
        refreshTokenFn
      ),
      methods: [HttpMethod.POST],
    });
  }

  private createSheetParseResource() {
    const getStatisticDataArn = StringParameter.fromStringParameterName(
      this,
      "get-statistic-data-function-arn",
      "/api/get-statistic-data"
    );

    const getStatisticDataFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-get-statistic-data",
      getStatisticDataArn.stringValue
    );

    this.api.addRoutes({
      path: "/v1/files/statistic",
      integration: new HttpLambdaIntegration(
        "integration-get-statistic-data",
        getStatisticDataFn
      ),
      methods: [HttpMethod.GET],
    });

    const getFilesDataArn = StringParameter.fromStringParameterName(
      this,
      "get-files-data-function-arn",
      "/api/get-files-data"
    );

    const getFilesDataFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-get-files-data",
      getFilesDataArn.stringValue
    );

    this.api.addRoutes({
      path: "/v1/files",
      integration: new HttpLambdaIntegration(
        "integration-get-files-data",
        getFilesDataFn
      ),
      methods: [HttpMethod.GET],
    });

    const generatePreSignedUrlArn = StringParameter.fromStringParameterName(
      this,
      "generate-pre-signed-url-function-arn",
      "/api/generate-pre-signed-url"
    );

    const generatePreSignedUrlFn = NodejsFunction.fromFunctionArn(
      this,
      "lambda-generate-pre-signed-url",
      generatePreSignedUrlArn.stringValue
    );

    this.api.addRoutes({
      path: "/v1/files/generate-pre-signed-url",
      integration: new HttpLambdaIntegration(
        "integration-generate-pre-signed-url",
        generatePreSignedUrlFn
      ),
      methods: [HttpMethod.POST],
    });
  }
}
