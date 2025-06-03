import { Construct } from "constructs";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { Route53Construct } from "./route53.construct";

interface ACMConstructProps {
  route53: Route53Construct;
}

export class ACMConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    private readonly props: ACMConstructProps
  ) {
    super(scope, id);

    this.createCertificate();
  }

  private createCertificate = () => {
    new Certificate(this, "Certificate", {
      domainName: "*.igorcruz.space",
      validation: CertificateValidation.fromDns(this.props.route53.hostedZone),
    });
  };
}
