import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiConstruct, S3Construct, LambdaConstruct } from "../constructs";

export class SheetParseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiConstruct = new ApiConstruct(this, "apiConstruct");
    const s3Construct = new S3Construct(this, "s3Construct");
    new LambdaConstruct(this, "lambdaConstruct", {
      apiConstruct,
      s3Construct,
    });
  }
}
