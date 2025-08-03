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
    this.createConfirmFunction();
    this.createOauth2Function();
    this.createSignUpFunction();
  }

  private createSignUpFunction() {
    const fn = new NodejsFunction(this, "function-signup", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to signup a user",
      entry: join(__dirname, "../../../lambda/signup/handler.ts"),
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
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:mongodb/uri-*`,
        ],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:AdminCreateUser"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:AdminAddUserToGroup"],
        resources: [`arn:aws:cognito-idp:${region}:${account}:userpool/*`],
      })
    );

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    new StringParameter(this, "parameter-signup-function", {
      parameterName: "/lambda/signup/function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
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

  private createConfirmFunction() {
    const fn = new NodejsFunction(this, "function-confirm", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to handle email confirmation",
      entry: join(__dirname, "../../../lambda/confirm/handler.ts"),
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

    new StringParameter(this, "function-confirm-arn", {
      parameterName: "/auth/confirm/function/arn",
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
