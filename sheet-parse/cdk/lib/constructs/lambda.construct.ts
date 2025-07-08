import { aws_s3_notifications, Duration, Stack } from "aws-cdk-lib";
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
import { S3Construct } from "./s3.construct";
import { EventType } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaStackProps {
  s3Construct: S3Construct;
}

export class LambdaConstruct extends Construct {
  public readonly generatePreSignedUrlFunction: NodejsFunction;
  public readonly extractDataFunction: NodejsFunction;
  public readonly getFilesDataFunction: NodejsFunction;
  public readonly getStatisticDataFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: LambdaStackProps
  ) {
    super(scope, id);

    this.generatePreSignedUrlFunction = this.createGenerateUrlFunction();
    this.extractDataFunction = this.createExtractDataFunction();
    this.getFilesDataFunction = this.createGetFilesDataFunction();
    this.getStatisticDataFunction = this.createGetStatisticDataFunction();
  }

  private createGenerateUrlFunction() {
    const { bucket } = this.props.s3Construct;

    const fn = new NodejsFunction(this, "function-generate-pre-signed-url", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to send notifications",
      entry: join(
        __dirname,
        "../../../lambda/generate-presigned-url/handler.ts"
      ),
      handler: "generatePreSignedUrlHandler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantPut(fn);

    return fn;
  }

  private createGetFilesDataFunction() {
    const fn = new NodejsFunction(this, "function-get-files-data", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to get files data",
      entry: join(__dirname, "../../../lambda/get-files/handler.ts"),
      handler: "getFilesDataHanlder",
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

    return fn;
  }

  private createExtractDataFunction() {
    const { bucket } = this.props.s3Construct;

    const apiKey = StringParameter.fromStringParameterName(
      this,
      "parameter-api-key",
      "/api/api-key-value"
    ).stringValue;

    const fn = new NodejsFunction(this, "function-extract-data", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.minutes(15),
      description: "A Lambda function to send notifications",
      entry: join(__dirname, "../../../lambda/extract-data/handler.ts"),
      handler: "extractDataHandler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      environment: {
        API_URL: "https://api.igorcruz.space",
        API_KEY: apiKey,
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
      allowPublicSubnet: true,
    });

    fn.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );

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

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(fn)
    );

    bucket.grantRead(fn);

    bucket.grantDelete(fn);

    return fn;
  }

  private createGetStatisticDataFunction() {
    const fn = new NodejsFunction(this, "function-get-statistic-data", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to get statistic data",
      entry: join(__dirname, "../../../lambda/get-statistic/handler.ts"),
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

    return fn;
  }
}
