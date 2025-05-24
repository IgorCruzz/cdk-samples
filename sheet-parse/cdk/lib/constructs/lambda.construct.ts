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
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { join } from "node:path";
import { ApiConstruct } from "./api.construct";
import { S3Construct } from "./s3.construct";
import { DynamoDBConstruct } from "./dynamo.construct";
import { EventType } from "aws-cdk-lib/aws-s3";

interface LambdaStackProps {
  apiConstruct: ApiConstruct;
  s3Construct: S3Construct;
  dynamoDBConstruct: DynamoDBConstruct;
}

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id);

    this.createGenerateUrlFunction(props);
    this.createExtractDataFunction(props);
  }

  private createGenerateUrlFunction(props: LambdaStackProps) {
    const { sheetParseResource } = props.apiConstruct;
    const { bucket } = props.s3Construct;

    const generatePreSignedUrlFunction = new NodejsFunction(
      this,
      "GeneratePreSignedUrl",
      {
        memorySize: 128,
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        functionName: "GeneratePreSignedUrl",
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

    sheetParseResource.addMethod(
      "POST",
      new LambdaIntegration(generatePreSignedUrlFunction),
      {}
    );

    bucket.grantPut(generatePreSignedUrlFunction);

    return generatePreSignedUrlFunction;
  }

  private createExtractDataFunction(props: LambdaStackProps) {
    const { bucket } = props.s3Construct;
    const { table } = props.dynamoDBConstruct;

    const extractDataFunction = new NodejsFunction(
      this,
      "ExtractDataFunction",
      {
        memorySize: 128,
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        functionName: "ExtractDataFunction",
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
