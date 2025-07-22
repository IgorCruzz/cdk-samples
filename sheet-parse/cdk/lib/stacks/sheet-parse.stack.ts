import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Construct, LambdaConstruct } from "../constructs";

export class SheetParseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Construct = new S3Construct(this, "construct-s3");

    new LambdaConstruct(this, "construct-lambda", {
      s3Construct,
    });
  }
}
