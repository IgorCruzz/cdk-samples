import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ACMConstruct } from "../constructs/acm.construct";

export class AcmStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ACMConstruct(this, "ACMConstruct");
  }
}
