import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class S3Construct extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = this.createS3Bucket();
  }

  createS3Bucket() {
    return new Bucket(this, "bucket-sheet-parse", {
      removalPolicy: RemovalPolicy.RETAIN,
      publicReadAccess: false,
      cors: [
        {
          allowedMethods: [HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });
  }
}
