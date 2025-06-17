import { Construct } from "constructs";
import { Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { join } from "node:path";

export class S3Construct extends Construct {
  private readonly bucket: IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = this.webSiteBucket();

    new BucketDeployment(this, "deployment-bucket", {
      sources: [Source.asset(join(__dirname, "../../../app/build"))],
      destinationBucket: this.bucket,
      retainOnDelete: false,
    });
  }

  webSiteBucket() {
    return new Bucket(this, "bucket-static-website", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
    });
  }
}
