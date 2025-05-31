import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApiConstruct,
  S3Construct,
  LambdaConstruct,
  DynamoDBConstruct,
} from "../constructs";

export class SheetParseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiConstruct = new ApiConstruct(this, "apiConstruct");
    const s3Construct = new S3Construct(this, "s3Construct");

    const dynamoDBConstruct = new DynamoDBConstruct(this, "dynamoConstrut");

    const lambdaConstruct = new LambdaConstruct(this, "lambdaConstruct", {
      apiConstruct,
      s3Construct,
      dynamoDBConstruct,
    });

    Tags.of(apiConstruct.sheetParseApi).add("Project", "sheet-parse");
    Tags.of(apiConstruct.sheetParseApi).add("Name", "sheet-parse-api");

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
  }
}
