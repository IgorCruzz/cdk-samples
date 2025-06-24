import { Construct } from "constructs";
import { AccessLevel, Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { IBucket } from "aws-cdk-lib/aws-s3";


type CloudFrontConstructProps = {
bucket: IBucket
};




export class CloudFrontConstruct extends Construct { 
  constructor(
    scope: Construct, id: string, private readonly props: CloudFrontConstructProps
  ) {
    super(scope, id);
  }

  createDistribution() {
    const { bucket } = this.props;

    const s3Origin = S3BucketOrigin.withOriginAccessControl(bucket, {
    originAccessLevels: [AccessLevel.READ, AccessLevel.LIST],
    });

    return new Distribution(this, 'distribuition-frontend', {
      defaultBehavior: {
        origin: s3Origin },
      defaultRootObject: 'index.html',
      comment: 'Distribution for the frontend application',
    });
  }
}