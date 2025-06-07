import { Construct } from "constructs";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HostedZone } from "aws-cdk-lib/aws-route53";

export class CertificateConstruct extends Construct {
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const route53HostedZoneId = StringParameter.valueForStringParameter(
      this,
      "/route53/hosted-zone-id"
    );

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: route53HostedZoneId,
      zoneName: "igorcruz.space",
    });

    this.certificate = new Certificate(this, "certificate", {
      domainName: "api.igorcruz.space",
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
