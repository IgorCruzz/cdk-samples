import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  S3Construct,
  LambdaConstruct,
  DocumentDBConstruct,
  ApiConstruct,
} from "../constructs";

export class SheetParseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Construct = new S3Construct(this, "construct-s3");

    const documentDBConstruct = new DocumentDBConstruct(
      this,
      "construct-documentdb"
    );

    const lambdaConstruct = new LambdaConstruct(this, "construct-lambda", {
      s3Construct,
      documentDBConstruct,
    });

    const apiConstruct = new ApiConstruct(this, "construct-api", {
      sheetParseFunction: lambdaConstruct.generatePreSignedUrlFunction,
      getFilesDataFunction: lambdaConstruct.getFilesDataFunction,
    });

    Tags.of(s3Construct.bucket).add("Project", "sheet-parse");
    Tags.of(s3Construct.bucket).add("Name", "sheet-parse-bucket");

    Tags.of(documentDBConstruct.cluster).add("Project", "sheet-parse");
    Tags.of(documentDBConstruct.cluster).add("Name", "sheet-parse-cluster");

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
