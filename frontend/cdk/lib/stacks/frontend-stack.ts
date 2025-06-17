import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Construct } from "../constructs/s3.construct";

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new S3Construct(this, "S3Construct");
  }
}
