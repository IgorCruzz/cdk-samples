import { Construct } from "constructs";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HostedZone } from "aws-cdk-lib/aws-route53";

export class ACMConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createCertificate();
  }

  private createCertificate = (): ICertificate => {
    const hostedZoneArn = StringParameter.fromStringParameterAttributes(
      this,
      "hostedZoneArnParameter",
      {
        parameterName: "/route53/hosted-zone-arn",
      }
    );

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: hostedZoneArn.stringValue,
      zoneName: "igorcruz.space",
    });

    const certificate = new Certificate(this, "Certificate", {
      domainName: "*.igorcruz.space",
      validation: CertificateValidation.fromDns(hostedZone),
    });

    new StringParameter(this, "CertificateArn", {
      parameterName: "/acm/certificate-arn",
      stringValue: certificate.certificateArn,
    });

    return certificate;
  };
}
