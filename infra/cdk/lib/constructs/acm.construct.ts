import { Construct } from "constructs";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { Route53Construct } from "./route53.construct";

interface ACMConstructProps {
  route53: Route53Construct;
}

export class ACMConstruct extends Construct {
  public readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: ACMConstructProps
  ) {
    super(scope, id);

    this.certificate = this.createCertificate();
  }

  private createCertificate = (): ICertificate => {
    return new Certificate(this, "Certificate", {
      domainName: "*.igorcruz.space",
      validation: CertificateValidation.fromDns(this.props.route53.hostedZone),
    });
  };
}
