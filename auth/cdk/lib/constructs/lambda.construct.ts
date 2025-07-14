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

export class LambdaConstruct extends Construct {
  public readonly signinFunction: NodejsFunction; 

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.signinFunction = this.createSigninFunction();
  }

  private refreshTokenFunction() {
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
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:mongodb/uri-*`,
          `arn:aws:secretsmanager:${region}:${account}:secret:jwt/secret-*`,
        ],
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
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:mongodb/uri-*`,
          `arn:aws:secretsmanager:${region}:${account}:secret:jwt/secret-*`,
        ],
      })
    );

    return fn;  
  } 
}
