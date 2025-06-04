import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiConstruct } from "../constructs/api.construct";
import { Route53Construct } from "../constructs/route53.construct";
import { ACMConstruct } from "../constructs/acm.construct";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const route53 = new Route53Construct(this, "Route53Construct");
    const acm = new ACMConstruct(this, "ACMConstruct", {
      route53,
    });
    new ApiConstruct(this, "XyzApi", {
      acm,
      route53,
    });
  }
}
