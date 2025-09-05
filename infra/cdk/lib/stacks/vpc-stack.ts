import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcConstruct } from "../constructs";

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new VpcConstruct(this, "construct-vpc");
  }
}
