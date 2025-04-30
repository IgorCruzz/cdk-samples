import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ApiConstruct } from './api.construct';
import { SNSConstruct } from './sns.construct';
import { SQSConstruct } from './sqs.construct';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

interface LambdaStackProps {
    sqsConstruct: SQSConstruct;
    snsConstruct: SNSConstruct;
    apiConstruct: ApiConstruct;
}

export class LambdaConstruct extends Construct {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id);

        this.createSendFunction(props);
        this.createProcessFunction(props);
        this.createDlqFunction(props);
    }

    private createSendFunction(props: LambdaStackProps) {
        const { notifierSNSTopic } = props.snsConstruct;

        const { notifierResource, notificationsPostRequestModel, notificationsPostRequestValidator } =
            props.apiConstruct;

        const notifierSendHandler = new NodejsFunction(this, 'notifierSendHandler', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notifierSendHandler',
            description: 'A Lambda function to send notifications',
            entry: 'lambda/handlers.ts',
            handler: 'notifierSendHandler',
            environment: {
                SNS_TOPIC_ARN: notifierSNSTopic.topicArn,
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notifierSNSTopic.grantPublish(notifierSendHandler);

        notifierResource.addMethod('POST', new LambdaIntegration(notifierSendHandler), {
            requestModels: {
                'application/json': notificationsPostRequestModel,
            },
            requestValidator: notificationsPostRequestValidator,
        });

        return notifierSendHandler;
    }

    private createProcessFunction(props: LambdaStackProps) {
        const { notifierEmailQueue, notifierSMSQueue, notifierWhatsappQueue } = props.sqsConstruct;

        const ACCOUNT_SID = StringParameter.fromStringParameterName(this, 'accountSidParameter', '/twilio/accountSid');

        const AUTH_TOKEN = StringParameter.fromStringParameterName(this, 'authTokenParameter', '/twilio/authToken');

        const SENDER_PHONE = StringParameter.fromStringParameterName(
            this,
            'senderPhoneParameter',
            '/twilio/senderPhone',
        );

        const RECEIVER_PHONE = StringParameter.fromStringParameterName(
            this,
            'notifierReceiverPhoneParameter',
            '/twilio/mynumber',
        );

        const notiferProcessFunction = new NodejsFunction(this, 'notifierProcessFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferProcessFunction',
            description: 'A Lambda function to process notifications',
            entry: 'lambda/handlers.ts',
            handler: 'notifierProcessHandler',
            environment: {
                TWILIO_ACCOUNT_SID: ACCOUNT_SID.stringValue,
                TWILIO_AUTH_TOKEN: AUTH_TOKEN.stringValue,
                TWILIO_SENDER_PHONE: SENDER_PHONE.stringValue,
                TWILIO_RECEIVER_PHONE: RECEIVER_PHONE.stringValue,
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierEmailQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierSMSQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notiferProcessFunction.addEventSource(
            new SqsEventSource(notifierWhatsappQueue, {
                batchSize: 10,
                reportBatchItemFailures: true,
            }),
        );

        notifierEmailQueue.grantConsumeMessages(notiferProcessFunction);
        notifierSMSQueue.grantConsumeMessages(notiferProcessFunction);
        notifierWhatsappQueue.grantConsumeMessages(notiferProcessFunction);

        return notiferProcessFunction;
    }

    private createDlqFunction(props: LambdaStackProps) {
        const { notifierDLQ } = props.sqsConstruct;

        const notiferDlqFunction = new NodejsFunction(this, 'notiferDlqFunction', {
            memorySize: 256,
            architecture: Architecture.X86_64,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(30),
            functionName: 'notiferDlqFunction',
            description: 'A Lambda function to process notifications from DLQ',
            entry: 'lambda/handlers.ts',
            handler: 'notifierProcessDLQHandler',
            bundling: {
                minify: true,
                sourceMap: true,
                target: 'es2020',
            },
            loggingFormat: LoggingFormat.JSON,
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        notiferDlqFunction.addEventSource(
            new SqsEventSource(notifierDLQ, {
                batchSize: 10,
            }),
        );

        notifierDLQ.grantConsumeMessages(notiferDlqFunction);
    }
}
