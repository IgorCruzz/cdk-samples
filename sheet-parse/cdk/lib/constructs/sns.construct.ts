import { Construct } from "constructs";
import {
  Topic,
  TracingConfig,
  ITopic,
  Subscription,
  SubscriptionProtocol,
} from "aws-cdk-lib/aws-sns";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class SNSConstruct extends Construct {
  public readonly notifierSNSTopic: ITopic;
  public readonly alertSNSTopic: ITopic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.notifierSNSTopic = this.createNotifierSNSTopic();
    this.alertSNSTopic = this.crateAlertSNSTopic();
  }

  private createNotifierSNSTopic() {
    return new Topic(this, "notifierSNS", {
      displayName: "Notifier SNS Topic",
      tracingConfig: TracingConfig.ACTIVE,
    });
  }

  private crateAlertSNSTopic() {
    const topic = new Topic(this, "alertSNS", {
      displayName: "Alert SNS Topic",
      tracingConfig: TracingConfig.ACTIVE,
    });

    const SNS_SUB_NUMBER = StringParameter.fromStringParameterName(
      this,
      "snsSubNumberParameter",
      "/sns/sub-number"
    );

    new Subscription(this, "alertTopicSubscription", {
      topic,
      endpoint: SNS_SUB_NUMBER.stringValue,
      protocol: SubscriptionProtocol.SMS,
    });

    return topic;
  }
}
