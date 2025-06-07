import { Construct } from "constructs";
import { DomainName } from 'aws-cdk-lib/aws-apigateway'


export class DomainNameConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    

    






    
    new DomainName(this, 'DomainName', {
      domainName: 'api.example.com',
      certificate: {
        certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012'
      },
      endpointType: 'REGIONAL',
      securityPolicy: 'TLS_1_2'
    });
  }
} 