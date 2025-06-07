import { Construct } from "constructs";
import { DomainName, EndpointType } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  HostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from "aws-cdk-lib/aws-route53";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";

interface DomainNameProps {
  certificate: ICertificate;
}

export class DomainNameConstruct extends Construct {
  constructor(scope: Construct, id: string, readonly props: DomainNameProps) {
    super(scope, id);

    const domain = new DomainName(this, "domain-name", {
      domainName: "api.igorcruz.space",
      certificate: this.props.certificate,
      endpointType: EndpointType.REGIONAL,
    });

    const route53HostedZoneId = StringParameter.valueForStringParameter(
      this,
      "/route53/hosted-zone-id"
    );

    const zone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: route53HostedZoneId,
      zoneName: "igorcruz.space",
    });

    new RecordSet(this, "record-set-api", {
      zone,
      recordName: "api.igorcruz.space",
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(domain)),
    });
  }
}
