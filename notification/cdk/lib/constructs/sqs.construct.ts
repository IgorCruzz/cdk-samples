import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { PolicyStatement, ServicePrincipal, Effect } from "aws-cdk-lib/aws-iam";
import {
  Subscription,
  SubscriptionFilter,
  SubscriptionProtocol,
} from "aws-cdk-lib/aws-sns";
import { SNSConstruct } from "./sns.construct";

interface SQSStackProps {
  snsConstruct: SNSConstruct;
}

export class SQSConstruct extends Construct {
  public readonly notifierSMSQueue: IQueue;
  public readonly notifierEmailQueue: IQueue;
  public readonly notifierWhatsappQueue: IQueue;
  public readonly notifierDLQ: IQueue;

  private deadLetterQueue: { maxReceiveCount: number; queue: IQueue };

  constructor(
    scope: Construct,
    id: string,
    private readonly props: SQSStackProps
  ) {
    super(scope, id);

    this.notifierDLQ = this.createNotifierDLQ();

    this.notifierEmailQueue = this.createNotifierEmailQueue();

    this.notifierWhatsappQueue = this.createNotifierWhatsappQueue();
  }

  private createNotifierDLQ() {
    const queue = new Queue(this, "notifierDLQ", {
      retentionPeriod: Duration.days(1),
      visibilityTimeout: Duration.seconds(30),
    });

    this.deadLetterQueue = {
      maxReceiveCount: 5,
      queue,
    };

    return queue;
  }

  private createNotifierEmailQueue() {
    const { notifierSNSTopic } = this.props.snsConstruct;

    const queue = new Queue(this, "notifierEmailQueue", {
      visibilityTimeout: Duration.seconds(30),
      retentionPeriod: Duration.days(1),
      deadLetterQueue: this.deadLetterQueue,
    });

    queue.addToResourcePolicy(
      new PolicyStatement({
        actions: ["SQS:SendMessage"],
        resources: [queue.queueArn],
        principals: [new ServicePrincipal("sns.amazonaws.com")],
        effect: Effect.ALLOW,
        conditions: {
          ArnEquals: {
            "aws:SourceArn": notifierSNSTopic.topicArn,
          },
        },
      })
    );

    new Subscription(this, "emailQueueSubscription", {
      topic: notifierSNSTopic,
      endpoint: queue.queueArn,
      protocol: SubscriptionProtocol.SQS,
      rawMessageDelivery: true,
      filterPolicy: {
        service: SubscriptionFilter.stringFilter({
          allowlist: ["EMAIL"],
        }),
      },
    });

    return queue;
  }

  private createNotifierWhatsappQueue() {
    const { notifierSNSTopic } = this.props.snsConstruct;

    const queue = new Queue(this, "notifierWhatsappQueue", {
      visibilityTimeout: Duration.seconds(30),
      retentionPeriod: Duration.days(1),
      deadLetterQueue: this.deadLetterQueue,
    });

    queue.addToResourcePolicy(
      new PolicyStatement({
        actions: ["SQS:SendMessage"],
        resources: [queue.queueArn],
        principals: [new ServicePrincipal("sns.amazonaws.com")],
        effect: Effect.ALLOW,
        conditions: {
          ArnEquals: {
            "aws:SourceArn": notifierSNSTopic.topicArn,
          },
        },
      })
    );

    new Subscription(this, "whatsappQueueSubscription", {
      topic: notifierSNSTopic,
      endpoint: queue.queueArn,
      protocol: SubscriptionProtocol.SQS,
      rawMessageDelivery: true,
      filterPolicy: {
        service: SubscriptionFilter.stringFilter({
          allowlist: ["WHATSAPP"],
        }),
      },
    });

    return queue;
  }
}
