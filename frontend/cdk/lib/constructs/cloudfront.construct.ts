import { Construct } from "constructs";
import {
  AccessLevel,
  AllowedMethods,
  Distribution,
  HttpVersion,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

type CloudFrontConstructProps = {
  bucket: IBucket;
};

export class CloudFrontConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    private readonly props: CloudFrontConstructProps
  ) {
    super(scope, id);
  }

  createDistribution() {
    const { bucket } = this.props;

    const s3Origin = S3BucketOrigin.withOriginAccessControl(bucket, {
      originAccessLevels: [AccessLevel.READ, AccessLevel.LIST],
    });

    return new Distribution(this, "distribuition-frontend", {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
      },
      defaultRootObject: "index.html",
      comment: "Distribution for the frontend application",
      httpVersion: HttpVersion.HTTP2,
      certificate: Certificate.fromCertificateArn(
        this,
        "cert",
        "arn:aws:acm:..."
      ),
      domainNames: ["www.igorcru.space"],
      enabled: true,
      priceClass: PriceClass.PRICE_CLASS_100,
      enableLogging: true,
      logBucket: bucket,
      logFilePrefix: "cloudfront-logs/",
      enableIpv6: true,
    });
  }
}
