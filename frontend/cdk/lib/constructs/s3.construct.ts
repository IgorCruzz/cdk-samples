import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

export class S3Construct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket();
  }

  bucket() {
    return new Bucket(this, "bucket-static-website", {
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
