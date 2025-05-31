import { Stack, StackProps, Tags } from "aws-cdk-lib";
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
    const lambdaConstruct = new LambdaConstruct(this, "LambdaConstruct", {
      apiConstruct,
      snsConstruct,
      sqsConstruct,
    });

    Tags.of(apiConstruct.notifierApi).add("Project", "notifier");
    Tags.of(apiConstruct.notifierApi).add("Name", "notifier-api");

    Tags.of(snsConstruct.alertSNSTopic).add("Project", "notifier");
    Tags.of(snsConstruct.alertSNSTopic).add("Name", "alert-topic");

    Tags.of(snsConstruct.notifierSNSTopic).add("Project", "notifier");
    Tags.of(snsConstruct.notifierSNSTopic).add("Name", "notifier-topic");

    Tags.of(sqsConstruct.notifierDLQ).add("Project", "notifier");
    Tags.of(sqsConstruct.notifierDLQ).add("Name", "notifier-dlq");

    Tags.of(sqsConstruct.notifierEmailQueue).add("Project", "notifier");
    Tags.of(sqsConstruct.notifierEmailQueue).add(
      "Name",
      "notifier-email-queue"
    );

    Tags.of(sqsConstruct.notifierSMSQueue).add("Project", "notifier");
    Tags.of(sqsConstruct.notifierSMSQueue).add("Name", "notifier-sms-queue");

    Tags.of(sqsConstruct.notifierWhatsappQueue).add("Project", "notifier");
    Tags.of(sqsConstruct.notifierWhatsappQueue).add(
      "Name",
      "notifier-whatsapp-queue"
    );

    Tags.of(lambdaConstruct.dlqFunction).add("Project", "notifier");
    Tags.of(lambdaConstruct.dlqFunction).add("Name", "notifier-dlq-handler");

    Tags.of(lambdaConstruct.processFunction).add("Project", "notifier");
    Tags.of(lambdaConstruct.processFunction).add("Name", "process-function");

    Tags.of(lambdaConstruct.sendFunction).add("Project", "notifier");
    Tags.of(lambdaConstruct.sendFunction).add("Name", "send-function");
  }
}
