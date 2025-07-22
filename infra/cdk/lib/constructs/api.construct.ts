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
import { IUserPool, IUserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Stack } from "aws-cdk-lib";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";

export class ApiConstruct extends Construct {
  public readonly api: HttpApi;
  private readonly authorizer: HttpJwtAuthorizer;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: {
      certificate: ICertificate;
      userPool: IUserPool;
      userPoolClient: IUserPoolClient;
    }
  ) {
    super(scope, id);

    this.api = this.createApi();
    this.authorizer = this.createAuthorizer();
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
        allowHeaders: ["Content-Type", "Authorization"],
      },
      defaultDomainMapping: {
        domainName,
        mappingKey: "v1",
      },
    });

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
      authorizer: this.authorizer,
    });

    this.api.addRoutes({
      path: "/users/{id}",
      integration: new HttpLambdaIntegration(
        "integration-update-user",
        updateUserFn
      ),
      methods: [HttpMethod.PUT],
      authorizer: this.authorizer,
    });

    this.api.addRoutes({
      path: "/users",
      integration: new HttpLambdaIntegration(
        "integration-get-users",
        getUsersFn
      ),
      methods: [HttpMethod.GET],
      authorizer: this.authorizer,
    });

    this.api.addRoutes({
      path: "/users",
      integration: new HttpLambdaIntegration(
        "integration-create-user",
        createUserFn
      ),
      methods: [HttpMethod.POST],
      authorizer: this.authorizer,
    });

    createUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    getUsersFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    updateUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    deleteUserFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
  }

  private createAuthResource() {
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

    const sendPasswordArn = StringParameter.fromStringParameterName(
      this,
      "send-password-function-arn",
      "/auth/password/function/arn"
    );

    const sendPasswordFn = NodejsFunction.fromFunctionAttributes(
      this,
      "lambda-send-password",
      {
        functionArn: sendPasswordArn.stringValue,
        sameEnvironment: true,
      }
    );

    this.api.addRoutes({
      path: "/auth/password",
      integration: new HttpLambdaIntegration(
        "integration-new-password",
        sendPasswordFn
      ),
      methods: [HttpMethod.POST],
    });

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

    sendPasswordFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
    signinFn.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    refreshTokenFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }

  private createSheetParseResource() {
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
      authorizer: this.authorizer,
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
      authorizer: this.authorizer,
    });

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
      authorizer: this.authorizer,
    });

    sendNotificationFn.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }

  private createAuthorizer() {
    const region = Stack.of(this).region;

    return new HttpJwtAuthorizer(
      "authorizer-jwt",
      `https://cognito-idp.${region}.amazonaws.com/${this.props.userPool.userPoolId}`,
      {
        jwtAudience: [this.props.userPoolClient.userPoolClientId],
        identitySource: ["$request.header.Authorization"],
      }
    );
  }
}
