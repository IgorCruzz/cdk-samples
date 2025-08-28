import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaConstruct } from "../constructs/lambda.construct";
import { Construct } from "constructs";

export class CronJobStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new LambdaConstruct(this, "construct-lambda");
  }
}
