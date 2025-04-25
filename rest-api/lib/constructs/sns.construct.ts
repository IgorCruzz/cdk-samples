import { Construct } from 'constructs';
import { Topic, TracingConfig, ITopic } from 'aws-cdk-lib/aws-sns';

export class SNSConstruct extends Construct {
    public readonly notifierSNSTopic: ITopic;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.notifierSNSTopic = this.createNotifierSNSTopic();
    }

    private createNotifierSNSTopic() {
        return new Topic(this, 'notifierSNS', {
            displayName: 'Notifier SNS Topic',
            topicName: 'notifierTopic',
            tracingConfig: TracingConfig.ACTIVE,
        });
    }
}
