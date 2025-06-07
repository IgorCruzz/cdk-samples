import { Construct } from "constructs";
import { DomainName, EndpointType } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";

interface DomainNameProps {
  certificate: ICertificate;
}

export class DomainNameConstruct extends Construct {
  constructor(scope: Construct, id: string, readonly props: DomainNameProps) {
    super(scope, id);

    new DomainName(this, "domain-name", {
      domainName: "api.igorcruz.space",
      certificate: this.props.certificate,
      endpointType: EndpointType.REGIONAL,
    });
  }
}
