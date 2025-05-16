import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApiConstruct,
  LambdaConstruct,
  SNSConstruct,
  SQSConstruct,
} from "../constructs";

export class NotifierStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiConstruct = new ApiConstruct(this, "apiConstruct");
    const snsConstruct = new SNSConstruct(this, "snsConstruct");
    const sqsConstruct = new SQSConstruct(this, "sqsConstruct", {
      snsConstruct,
    });
    new LambdaConstruct(this, "LambdaConstruct", {
      apiConstruct,
      snsConstruct,
      sqsConstruct,
    });
  }
}
