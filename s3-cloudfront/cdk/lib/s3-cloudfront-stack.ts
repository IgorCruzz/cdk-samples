import { RemovalPolicy, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3'; 
import { AllowedMethods, Distribution, HttpVersion, PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class S3CloudfrontStack extends Stack { 

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

     const certificate = StringParameter.fromStringParameterName(
        this,
        'notifierCertificateParameter',
        '/certs/notifier-api',
    );

    this.createWebSite({ 
      bucketName: 'igorcruz-web',
      certificate: certificate.stringValue,  
      domainNames: ['web.igorcruz.space'] }); 
  }

  createWebSite = ({  certificate, domainNames, bucketName }: { bucketName: string; certificate: string, domainNames: string[]}) => {
     const bucket = new Bucket(this, 'BucketExample', { 
      bucketName,
      blockPublicAccess: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },   
      removalPolicy: RemovalPolicy.RETAIN,    
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
    }) 

    const distribution = new Distribution(this, 'CloudfrontDistribution', {
    enabled: true,
    defaultBehavior: {
      origin: new S3StaticWebsiteOrigin(bucket),     
      compress: true,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,  
                  
    },       
    defaultRootObject: 'index.html',
    certificate: Certificate.fromCertificateArn(this, 'notifierCertificate', certificate),
    priceClass: PriceClass.PRICE_CLASS_ALL,
    enableIpv6: true, 
    httpVersion: HttpVersion.HTTP2,
    domainNames, 

  }) 

  return new CfnOutput(this, 'BucketWebsiteURL', {
    value: distribution.distributionDomainName, 
    description: 'Distribution Domain Name', 
    exportName: 'DistributionDomainName',
  });
  } 
}
