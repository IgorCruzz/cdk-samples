import { Duration } from "aws-cdk-lib";
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

interface LambdaStackProps {
  apiConstruct: ApiConstruct;
  s3Construct: S3Construct;
}

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id);

    this.createGenerateUrlFunction(props);
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
}
