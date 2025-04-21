import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { PolicyStatement, ServicePrincipal, Effect } from 'aws-cdk-lib/aws-iam';
import { ITopic, Subscription, SubscriptionFilter, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { SNSConstruct } from './sns.construct';

interface SQSStackProps {
    snsConstruct: SNSConstruct;
}

interface QueueProps {
    deadLetterQueue: { maxReceiveCount: number; queue: IQueue };
    notifierSNSTopic: ITopic;
    queueName: string;
    subscriptionName: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class SQSConstruct extends Construct {
    public readonly notifierHighPriorityQueue: IQueue;
    public readonly notifierMediumPriorityQueue: IQueue;
    public readonly notifierLowPriorityQueue: IQueue;
    public readonly notifierDLQ: IQueue;

    constructor(scope: Construct, id: string, public readonly props: SQSStackProps) {
        super(scope, id);

        const {
            snsConstruct: { notifierSNSTopic },
        } = props;

        this.notifierDLQ = this.createNotifierDLQ();

        const deadLetterQueue = {
            maxReceiveCount: 5,
            queue: this.notifierDLQ,
        };

        this.notifierHighPriorityQueue = this.createNotifierPriorityQueue({
            deadLetterQueue,
            notifierSNSTopic,
            priority: 'HIGH',
            queueName: 'notifierHighPriorityQueue',
            subscriptionName: 'highPrioritySubscription',
        });

        this.notifierMediumPriorityQueue = this.createNotifierPriorityQueue({
            deadLetterQueue,
            notifierSNSTopic,
            priority: 'MEDIUM',
            queueName: 'notifierMediumPriorityQueue',
            subscriptionName: 'mediumPrioritySubscription',
        });

        this.notifierLowPriorityQueue = this.createNotifierPriorityQueue({
            deadLetterQueue,
            notifierSNSTopic,
            priority: 'LOW',
            queueName: 'notifierLowPriorityQueue',
            subscriptionName: 'lowPrioritySubscription',
        });
    }

    private createNotifierDLQ() {
        const notifierDLQ = new Queue(this, 'notifierDLQ', {
            queueName: 'notifierDLQ',
            retentionPeriod: Duration.days(1),
            visibilityTimeout: Duration.seconds(30),
        });

        return notifierDLQ;
    }

    private createNotifierPriorityQueue({
        deadLetterQueue,
        notifierSNSTopic,
        queueName,
        subscriptionName,
        priority,
    }: QueueProps) {
        const notifierPriorityQueue = new Queue(this, queueName, {
            queueName,
            visibilityTimeout: Duration.seconds(30),
            retentionPeriod: Duration.days(1),
            deadLetterQueue,
        });

        notifierPriorityQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [notifierPriorityQueue.queueArn],
                principals: [new ServicePrincipal('sns.amazonaws.com')],
                effect: Effect.ALLOW,
                conditions: {
                    ArnEquals: {
                        'aws:SourceArn': notifierSNSTopic.topicArn,
                    },
                },
            }),
        );

        new Subscription(this, subscriptionName, {
            topic: notifierSNSTopic,
            endpoint: notifierPriorityQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: [priority],
                }),
            },
        });

        return notifierPriorityQueue;
    }
}
