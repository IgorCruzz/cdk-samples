import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { PolicyStatement, ServicePrincipal, Effect } from 'aws-cdk-lib/aws-iam';
import { Subscription, SubscriptionFilter, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { SNSStack } from './sns-stack';

interface SQSStackProps extends StackProps {
    snsStack: SNSStack;
}

export class SQSStack extends Stack {
    public readonly notifierHighPriorityQueue: Queue;
    public readonly notifierMediumPriorityQueue: Queue;
    public readonly notifierLowPriorityQueue: Queue;

    constructor(scope: Construct, id: string, public readonly props: SQSStackProps) {
        super(scope, id, props);

        const {
            snsStack: { notifierSNSTopic },
        } = props;

        const notifierDLQ = new Queue(this, 'notifierDLQ', {
            queueName: 'notifierDLQ',
            retentionPeriod: Duration.days(1),
            visibilityTimeout: Duration.seconds(30),
        });

        const deadLetterQueueConfig = {
            maxReceiveCount: 5,
            queue: notifierDLQ,
        };

        this.notifierHighPriorityQueue = new Queue(this, 'notifierHighPriorityQueue', {
            queueName: 'notifierHighPriorityQueue',
            visibilityTimeout: Duration.seconds(30),
            retentionPeriod: Duration.days(1),
            deadLetterQueue: deadLetterQueueConfig,
        });

        this.notifierMediumPriorityQueue = new Queue(this, 'notifierMediumPriorityQueue', {
            queueName: 'notifierMediumPriorityQueue',
            visibilityTimeout: Duration.seconds(30),
            retentionPeriod: Duration.days(1),
            deadLetterQueue: deadLetterQueueConfig,
        });

        this.notifierLowPriorityQueue = new Queue(this, 'notifierLowPriorityQueue', {
            queueName: 'notifierLowPriorityQueue',
            visibilityTimeout: Duration.seconds(30),
            retentionPeriod: Duration.days(1),
            deadLetterQueue: deadLetterQueueConfig,
        });

        this.notifierHighPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [this.notifierHighPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        this.notifierMediumPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [this.notifierMediumPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        this.notifierLowPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [this.notifierLowPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        new Subscription(this, 'highPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: this.notifierHighPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['HIGH'],
                }),
            },
        });

        new Subscription(this, 'mediumPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: this.notifierMediumPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['MEDIUM'],
                }),
            },
        });

        new Subscription(this, 'lowPrioritySubscription', {
            topic: notifierSNSTopic,
            endpoint: this.notifierLowPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: ['LOW'],
                }),
            },
        });
    }
}
