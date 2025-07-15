import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CertificateConstruct, DomainNameConstruct } from "../constructs";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { certificate } = new CertificateConstruct(
      this,
      "construct-certificate"
    );
    new DomainNameConstruct(this, "construct-domain-Name", {
      certificate,
    });
  }
}
