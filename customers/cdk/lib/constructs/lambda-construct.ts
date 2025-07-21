import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  Architecture,
  LoggingFormat,
  Runtime,
  Tracing,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { join } from "path";

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createGetCustomersFunction();
  }

  private createGetCustomersFunction() {
    const fn = new NodejsFunction(this, "function-get-customers", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to get customers data",
      entry: join(__dirname, "../../../lambda/get-customers/handler.ts"),
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

    new StringParameter(this, "parameter-get-customers-function", {
      parameterName: "/lambda/get-customers-function-arn",
      stringValue: fn.functionArn,
    });

    return fn;
  }
}
