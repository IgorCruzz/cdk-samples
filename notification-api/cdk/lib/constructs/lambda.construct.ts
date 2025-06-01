import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  Architecture,
  LoggingFormat,
  Runtime,
  Tracing,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { SNSConstruct } from "./sns.construct";
import { SQSConstruct } from "./sqs.construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { join } from "node:path";

interface LambdaStackProps {
  sqsConstruct: SQSConstruct;
  snsConstruct: SNSConstruct;
}

export class LambdaConstruct extends Construct {
  public readonly sendFunction: NodejsFunction;
  public readonly processFunction: NodejsFunction;
  public readonly dlqFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id);

    this.sendFunction = this.createSendFunction(props);
    this.processFunction = this.createProcessFunction(props);
    this.dlqFunction = this.createDlqFunction(props);
  }
  private createSendFunction(props: LambdaStackProps) {
    const { notifierSNSTopic } = props.snsConstruct;

    const {
      notifierResource,
      notificationsPostRequestModel,
      notificationsPostRequestValidator,
    } = props.apiConstruct;

    const notifierSendHandler = new NodejsFunction(
      this,
      "notifierSendHandler",
      {
        memorySize: 256,
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        functionName: "notifierSendHandler",
        description: "A Lambda function to send notifications",
        entry: join(__dirname, "../../../lambda/send-notification/handler.ts"),
        handler: "notifierSendHandler",
        environment: {
          SNS_TOPIC_ARN: notifierSNSTopic.topicArn,
        },
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["@aws-sdk/*"],
        },
        loggingFormat: LoggingFormat.JSON,
        tracing: Tracing.ACTIVE,
        logRetention: RetentionDays.ONE_WEEK,
      }
    );

    notifierSNSTopic.grantPublish(notifierSendHandler);

    notifierResource.addMethod(
      "POST",
      new LambdaIntegration(notifierSendHandler),
      {
        requestModels: {
          "application/json": notificationsPostRequestModel,
        },
        requestValidator: notificationsPostRequestValidator,
      }
    );

    return notifierSendHandler;
  }

  private createProcessFunction(props: LambdaStackProps) {
    const { notifierEmailQueue, notifierWhatsappQueue } = props.sqsConstruct;

    const ACCOUNT_SID = StringParameter.fromStringParameterName(
      this,
      "accountSidParameter",
      "/twilio/accountSid"
    );

    const AUTH_TOKEN = StringParameter.fromStringParameterName(
      this,
      "authTokenParameter",
      "/twilio/authToken"
    );

    const SENDER_PHONE = StringParameter.fromStringParameterName(
      this,
      "senderPhoneParameter",
      "/twilio/senderPhone"
    );

    const RECEIVER_PHONE = StringParameter.fromStringParameterName(
      this,
      "notifierReceiverPhoneParameter",
      "/twilio/mynumber"
    );

    const SES_IDENTITY = StringParameter.fromStringParameterName(
      this,
      "emailIdentityParameter",
      "/ses/emailIdentity"
    );

    const SES_ARN_IDENTITY = StringParameter.fromStringParameterName(
      this,
      "arnIdentityParameter",
      "/ses/arnIdentity"
    );

    const notiferProcessFunction = new NodejsFunction(
      this,
      "notifierProcessFunction",
      {
        memorySize: 256,
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        functionName: "notiferProcessFunction",
        description: "A Lambda function to process notifications",
        entry: join(
          __dirname,
          "../../../lambda/process-notification/handler.ts"
        ),
        handler: "notifierProcessHandler",
        environment: {
          TWILIO_ACCOUNT_SID: ACCOUNT_SID.stringValue,
          TWILIO_AUTH_TOKEN: AUTH_TOKEN.stringValue,
          TWILIO_SENDER_PHONE: SENDER_PHONE.stringValue,
          TWILIO_RECEIVER_PHONE: RECEIVER_PHONE.stringValue,
          SES_IDENTITY: SES_IDENTITY.stringValue,
        },
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
        },
        loggingFormat: LoggingFormat.JSON,
        tracing: Tracing.ACTIVE,
        logRetention: RetentionDays.ONE_WEEK,
      }
    );

    notiferProcessFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [SES_ARN_IDENTITY.stringValue],
        effect: Effect.ALLOW,
      })
    );

    notiferProcessFunction.addEventSource(
      new SqsEventSource(notifierEmailQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );

    notiferProcessFunction.addEventSource(
      new SqsEventSource(notifierWhatsappQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );

    notifierEmailQueue.grantConsumeMessages(notiferProcessFunction);
    notifierWhatsappQueue.grantConsumeMessages(notiferProcessFunction);

    return notiferProcessFunction;
  }

  private createDlqFunction(props: LambdaStackProps) {
    const { notifierDLQ } = props.sqsConstruct;
    const { alertSNSTopic } = props.snsConstruct;

    const notiferDlqFunction = new NodejsFunction(this, "notiferDlqFunction", {
      memorySize: 256,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      functionName: "notiferDlqFunction",
      description: "A Lambda function to process notifications from DLQ",
      entry: join(__dirname, "../../../lambda/process-dlq/handler.ts"),
      handler: "notifierProcessDLQHandler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        SNS_DLQ_TOPIC_ARN: alertSNSTopic.topicArn,
      },
    });

    notiferDlqFunction.addEventSource(
      new SqsEventSource(notifierDLQ, {
        batchSize: 10,
      })
    );

    alertSNSTopic.grantPublish(notiferDlqFunction);

    notifierDLQ.grantConsumeMessages(notiferDlqFunction);

    return notiferDlqFunction;
  }
}
