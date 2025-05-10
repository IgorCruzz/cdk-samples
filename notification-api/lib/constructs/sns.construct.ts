import { Construct } from 'constructs';
import { Topic, TracingConfig, ITopic, Subscription, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';

export class SNSConstruct extends Construct {
    public readonly notifierSNSTopic: ITopic;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.notifierSNSTopic = this.createNotifierSNSTopic();
        this.crateAlertSNSTopic();
    }

    private createNotifierSNSTopic() {
        return new Topic(this, 'notifierSNS', {
            displayName: 'Notifier SNS Topic',
            topicName: 'notifierTopic',
            tracingConfig: TracingConfig.ACTIVE,
        });
    }

    private crateAlertSNSTopic() {
        const topic = new Topic(this, 'alertSNS', {
            displayName: 'Alert SNS Topic',
            topicName: 'alertTopic',
            tracingConfig: TracingConfig.ACTIVE,
        });

        new Subscription(this, 'alertTopicSubscription', {
            topic: topic,
            endpoint: process.env.TWILIO_SENDER_PHONE as string,
            protocol: SubscriptionProtocol.SMS,
            rawMessageDelivery: true,
        });

        return;
    }
}
