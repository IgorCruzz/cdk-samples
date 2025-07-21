import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaConstruct } from "../constructs/lambda-construct";

export class CustomersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new LambdaConstruct(this, "construct-lambda");
  }
}
