import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Route53Construct } from "../constructs/route53.construct";

export class Route53Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Route53Construct(this, "Route53Construct");
  }
}
