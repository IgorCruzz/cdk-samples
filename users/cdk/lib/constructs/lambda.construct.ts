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
  public readonly getUsersFunction: NodejsFunction;
  public readonly createUserFunction: NodejsFunction;
  public readonly updateUserFunction: NodejsFunction;
  public readonly deleteUserFunction: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.getUsersFunction = this.createGetUsersFunction();
    this.createUserFunction = this.createCreateUserFunction();
    this.updateUserFunction = this.createUpdateUserFunction();
    this.deleteUserFunction = this.createDeleteUserFunction();
  }

  private createDeleteUserFunction() {
    const fn = new NodejsFunction(this, "function-delete-user", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to delete a user",
      entry: join(__dirname, "../../../lambda/delete-user/handler.ts"),
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

    new StringParameter(this, "parameter-delete-user-function", {
      parameterName: "/lambda/delete-user-function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }

  private createUpdateUserFunction() {
    const fn = new NodejsFunction(this, "function-update-user", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to update a user",
      entry: join(__dirname, "../../../lambda/update-user/handler.ts"),
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

    new StringParameter(this, "parameter-update-user-function", {
      parameterName: "/lambda/update-user-function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }

  private createCreateUserFunction() {
    const fn = new NodejsFunction(this, "function-create-user", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to create a user",
      entry: join(__dirname, "../../../lambda/create-user/handler.ts"),
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
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cognito/*`],
      })
    );

    new StringParameter(this, "parameter-create-user-function", {
      parameterName: "/lambda/create-user-function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }

  private createGetUsersFunction() {
    const fn = new NodejsFunction(this, "function-get-users", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to get users data",
      entry: join(__dirname, "../../../lambda/get-users/handler.ts"),
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

    new StringParameter(this, "parameter-get-users-function", {
      parameterName: "/lambda/get-users-function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }
}
