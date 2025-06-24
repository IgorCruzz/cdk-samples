import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Construct } from "../constructs/s3.construct";
import { CloudFrontConstruct } from '../constructs/cloudfront.construct';

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Construct = new S3Construct(this, "S3Construct");
    new CloudFrontConstruct(this, "construct-cloudfront", {
      bucket: s3Construct.bucket,
    })
  }
}
