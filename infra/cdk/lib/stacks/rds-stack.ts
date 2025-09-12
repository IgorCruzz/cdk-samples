import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RdsConstruct } from "../constructs";

export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new RdsConstruct(this, "construct-rds");
  }
}
