import { aws_s3_notifications, Duration } from "aws-cdk-lib";
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
import { DynamoDBConstruct } from "./dynamo.construct";
import { EventType } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface LambdaStackProps {
  s3Construct: S3Construct;
  dynamoDBConstruct: DynamoDBConstruct;
}

export class LambdaConstruct extends Construct {
  public readonly generatePreSignedUrlFunction: NodejsFunction;
  public readonly extractDataFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: LambdaStackProps
  ) {
    super(scope, id);

    this.generatePreSignedUrlFunction = this.createGenerateUrlFunction();
    this.extractDataFunction = this.createExtractDataFunction();
  }

  private createGenerateUrlFunction() {
    const { bucket } = this.props.s3Construct;

    const generatePreSignedUrlFunction = new NodejsFunction(
      this,
      "GeneratePreSignedUrl",
      {
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
      }
    );

    bucket.grantPut(generatePreSignedUrlFunction);

    new StringParameter(this, "generatePreSignedUrlFunctionParameter", {
      parameterName: "/lambda/generatePreSignedUrlFunction",
      stringValue: generatePreSignedUrlFunction.functionArn,
    });

    return generatePreSignedUrlFunction;
  }

  private createExtractDataFunction() {
    const { bucket } = this.props.s3Construct;
    const { table } = this.props.dynamoDBConstruct;

    const extractDataFunction = new NodejsFunction(
      this,
      "ExtractDataFunction",
      {
        memorySize: 128,
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        description: "A Lambda function to send notifications",
        entry: join(__dirname, "../../../lambda/extract-data/handler.ts"),
        handler: "extractDataHandler",
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
        },
        environment: {
          TABLE_NAME: "SheetParseTable",
        },
        loggingFormat: LoggingFormat.JSON,
        tracing: Tracing.ACTIVE,
        logRetention: RetentionDays.ONE_WEEK,
      }
    );

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(extractDataFunction)
    );

    table.grantReadWriteData(extractDataFunction);

    return extractDataFunction;
  }
}
