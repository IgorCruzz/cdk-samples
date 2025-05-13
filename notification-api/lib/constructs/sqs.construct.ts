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
    service: 'EMAIL' | 'SMS' | 'WHATSAPP';
}

export class SQSConstruct extends Construct {
    public readonly notifierSMSQueue: IQueue;
    public readonly notifierEmailQueue: IQueue;
    public readonly notifierWhatsappQueue: IQueue;
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

        this.notifierEmailQueue = this.createNotifierQueue({
            deadLetterQueue,
            notifierSNSTopic,
            service: 'EMAIL',
            queueName: 'notifierEmailQueue',
            subscriptionName: 'emailQueueSubscription',
        });

        this.notifierWhatsappQueue = this.createNotifierQueue({
            deadLetterQueue,
            notifierSNSTopic,
            service: 'WHATSAPP',
            queueName: 'notifierWhatsappQueue',
            subscriptionName: 'whatsappQueueSubscription',
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

    private createNotifierQueue({
        deadLetterQueue,
        notifierSNSTopic,
        queueName,
        subscriptionName,
        service,
    }: QueueProps) {
        const notifierQueue = new Queue(this, queueName, {
            queueName,
            visibilityTimeout: Duration.seconds(30),
            retentionPeriod: Duration.days(1),
            deadLetterQueue,
        });

        notifierQueue.addToResourcePolicy(
            new PolicyStatement({
                actions: ['SQS:SendMessage'],
                resources: [notifierQueue.queueArn],
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
            endpoint: notifierQueue.queueArn,
            protocol: SubscriptionProtocol.SQS,
            rawMessageDelivery: true,
            filterPolicy: {
                priority: SubscriptionFilter.stringFilter({
                    allowlist: [service],
                }),
            },
        });

        return notifierQueue;
    }
}
