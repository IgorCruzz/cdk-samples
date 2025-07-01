import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  S3Construct,
  LambdaConstruct,
  DynamoDBConstruct,
  ApiConstruct,
} from "../constructs";

export class SheetParseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Construct = new S3Construct(this, "construct-s3");

    const dynamoDBConstruct = new DynamoDBConstruct(this, "construct-dynamodb");

    const lambdaConstruct = new LambdaConstruct(this, "construct-lambda", {
      s3Construct,
      dynamoDBConstruct,
    });

    const apiConstruct = new ApiConstruct(this, "construct-api", {
      sheetParseFunction: lambdaConstruct.generatePreSignedUrlFunction,
      getFilesDataFunction: lambdaConstruct.getFilesDataFunction,
      getStatisticDataFunction: lambdaConstruct.getStatisticDataFunction,
    });

    Tags.of(s3Construct.bucket).add("Project", "sheet-parse");
    Tags.of(s3Construct.bucket).add("Name", "sheet-parse-bucket");

    Tags.of(dynamoDBConstruct.table).add("Project", "sheet-parse");
    Tags.of(dynamoDBConstruct.table).add("Name", "sheet-parse-table");

    Tags.of(lambdaConstruct.generatePreSignedUrlFunction).add(
      "Project",
      "sheet-parse"
    );
    Tags.of(lambdaConstruct.generatePreSignedUrlFunction).add(
      "Name",
      "generate-pre-signed-url-function"
    );

    Tags.of(lambdaConstruct.extractDataFunction).add("Project", "sheet-parse");
    Tags.of(lambdaConstruct.extractDataFunction).add(
      "Name",
      "extract-data-function"
    );

    Tags.of(apiConstruct.api).add("Project", "sheet-parse");
    Tags.of(apiConstruct.api).add("Name", "sheet-parse-api");
  }
}
