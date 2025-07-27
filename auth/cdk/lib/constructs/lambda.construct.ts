import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  Architecture,
  LoggingFormat,
  Runtime,
  Tracing,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { join } from "node:path";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createSigninFunction();
    this.createRefreshTokenFunction();
    this.createPasswordFunction();
    this.createOauth2Function();
  }

  private createRefreshTokenFunction() {
    const fn = new NodejsFunction(this, "function-refresh-token", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to handle token refresh",
      entry: join(__dirname, "../../../lambda/refresh/handler.ts"),
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:InitiateAuth"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    new StringParameter(this, "function-refresh-token-arn", {
      parameterName: "/auth/refresh-token/function/arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }

  private createPasswordFunction() {
    const fn = new NodejsFunction(this, "function-password", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to handle password management",
      entry: join(__dirname, "../../../lambda/password/handler.ts"),
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    new StringParameter(this, "function-password-arn", {
      parameterName: "/auth/password/function/arn",
      stringValue: fn.functionArn,
    });

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:RespondToAuthChallenge"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    return fn;
  }

  private createSigninFunction() {
    const fn = new NodejsFunction(this, "function-signin", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to handle user sign-in",
      entry: join(__dirname, "../../../lambda/signin/handler.ts"),
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:InitiateAuth"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    new StringParameter(this, "function-signin-arn", {
      parameterName: "/auth/signin/function/arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }

  private createOauth2Function() {
    const fn = new NodejsFunction(this, "function-oauth2", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to handle OAuth2 login requests",
      entry: join(__dirname, "../../../lambda/oauth2/handler.ts"),
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:*"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    new StringParameter(this, "function-oauth2-arn", {
      parameterName: "/auth/oauth2/function/arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }
}
