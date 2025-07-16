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
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

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
    this.createSheetParseResource();
    this.createNotificationResource();
  }

  private createApi() {
    const domainName = new DomainName(this, "domain-name", {
      domainName: "api.igorcruz.space",
      certificate: this.props.certificate,
      endpointType: EndpointType.REGIONAL,
    });

    new ARecord(this, "api-domain-record", {
      zone: HostedZone.fromLookup(this, "zone", {
        domainName: "igorcruz.space",
      }),
      recordName: "api",

      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId
        )
      ),
    });

    const api = new HttpApi(this, "http-api", {
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

    api.node.addDependency(domainName);

    return api;
  }

  private createUserResource() {
    const createUserArn = StringParameter.fromStringParameterName(
      this,
      "create-user-function-arn",
      "/lambda/create-user-function-arn"
    );

    const createUserFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-create-user",
      {
        functionArn: createUserArn.stringValue,
        sameEnvironment: true,
      }
    );

    const getUsersArn = StringParameter.fromStringParameterName(
      this,
      "get-users-function-arn",
      "/lambda/get-users-function-arn"
    );

    const getUsersFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-get-users",
      {
        functionArn: getUsersArn.stringValue,
        sameEnvironment: true,
      }
    );

    const updateUserArn = StringParameter.fromStringParameterName(
      this,
      "update-user-function-arn",
      "/lambda/update-user-function-arn"
    );

    const updateUserFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-update-user",
      {
        functionArn: updateUserArn.stringValue,
        sameEnvironment: true,
      }
    );

    const deleteUserArn = StringParameter.fromStringParameterName(
      this,
      "delete-user-function-arn",
      "/lambda/delete-user-function-arn"
    );

    const deleteUserFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-delete-user",
      {
        functionArn: deleteUserArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/users/{id}",
      integration: new HttpLambdaIntegration(
        "integration-delete-user",
        deleteUserFn
      ),
      methods: [HttpMethod.DELETE],
    });

    this.api.addRoutes({
      path: "/users/{id}",
      integration: new HttpLambdaIntegration(
        "integration-update-user",
        updateUserFn
      ),
      methods: [HttpMethod.PUT],
    });

    this.api.addRoutes({
      path: "/users",
      integration: new HttpLambdaIntegration(
        "integration-get-users",
        getUsersFn
      ),
      methods: [HttpMethod.GET],
    });

    this.api.addRoutes({
      path: "/users",
      integration: new HttpLambdaIntegration(
        "integration-create-user",
        createUserFn
      ),
      methods: [HttpMethod.POST],
    });

    createUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    getUsersFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    updateUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    deleteUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
  }

  private createAuthResource() {
    const signinArn = StringParameter.fromStringParameterName(
      this,
      "signin-function-arn",
      "/auth/signin/function/arn"
    );

    const signinFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-signin",
      {
        functionArn: signinArn.stringValue,
        sameEnvironment: true,
      }
    );

    const refreshTokenArn = StringParameter.fromStringParameterName(
      this,
      "refresh-token-function-arn",
      "/auth/refresh-token/function/arn"
    );

    const refreshTokenFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-refresh-token",
      {
        functionArn: refreshTokenArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/auth/signin",
      integration: new HttpLambdaIntegration("integration-signin", signinFn),
      methods: [HttpMethod.POST],
    });

    this.api.addRoutes({
      path: "/auth/refresh-token",
      integration: new HttpLambdaIntegration(
        "integration-refresh-token",
        refreshTokenFn
      ),
      methods: [HttpMethod.POST],
    });

    signinFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    refreshTokenFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }

  private createSheetParseResource() {
    const getStatisticDataArn = StringParameter.fromStringParameterName(
      this,
      "get-statistic-data-function-arn",
      "/api/get-statistic-data"
    );

    const getStatisticDataFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-get-statistic-data",
      {
        functionArn: getStatisticDataArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/files/statistic",
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

    const getFilesDataFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-get-files-data",
      {
        functionArn: getFilesDataArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/files",
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

    const generatePreSignedUrlFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-generate-pre-signed-url",
      {
        functionArn: generatePreSignedUrlArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/files/generate-pre-signed-url",
      integration: new HttpLambdaIntegration(
        "integration-generate-pre-signed-url",
        generatePreSignedUrlFn
      ),
      methods: [HttpMethod.POST],
    });

    getStatisticDataFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
    getFilesDataFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
    generatePreSignedUrlFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }

  private createNotificationResource() {
    const sendNotificationArn = StringParameter.fromStringParameterName(
      this,
      "send-notification-function-arn",
      "/api/send-notification"
    );

    const sendNotificationFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-send-notification",
      {
        functionArn: sendNotificationArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/notifications",
      integration: new HttpLambdaIntegration(
        "integration-send-notification",
        sendNotificationFn
      ),
      methods: [HttpMethod.POST],
    });

    sendNotificationFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }
}
