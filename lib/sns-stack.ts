import { StackProps, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Topic, TracingConfig } from 'aws-cdk-lib/aws-sns';

export class SNSStack extends Stack {
    public readonly notifierSNSTopic: Topic;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.notifierSNSTopic = new Topic(this, 'notifierSNS', {
            displayName: 'Notifier SNS Topic',
            topicName: 'notifierTopic',
            tracingConfig: TracingConfig.ACTIVE,
        });
    }
}
