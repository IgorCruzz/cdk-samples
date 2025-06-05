import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaConstruct, SNSConstruct, SQSConstruct } from "../constructs";

export class NotifierStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const snsConstruct = new SNSConstruct(this, "construct-sns");
    const sqsConstruct = new SQSConstruct(this, "construct-sqs", {
      snsConstruct,
    });

    new LambdaConstruct(this, "construct-lambda", {
      snsConstruct,
      sqsConstruct,
    });
  }
}
