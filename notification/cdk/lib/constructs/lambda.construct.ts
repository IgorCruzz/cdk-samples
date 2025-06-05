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
import { SNSConstruct } from "./sns.construct";
import { SQSConstruct } from "./sqs.construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

import { join } from "node:path";
import {
  JsonSchemaType,
  LambdaIntegration,
  MockIntegration,
  Model,
  PassthroughBehavior,
  RequestValidator,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

interface LambdaStackProps {
  sqsConstruct: SQSConstruct;
  snsConstruct: SNSConstruct;
}

export class LambdaConstruct extends Construct {
  public readonly sendFunction: NodejsFunction;
  public readonly processFunction: NodejsFunction;
  public readonly dlqFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    private readonly props: LambdaStackProps
  ) {
    super(scope, id);

    this.sendFunction = this.createSendFunction();
    this.processFunction = this.createProcessFunction();
    this.dlqFunction = this.createDlqFunction();
  }
  private createSendFunction() {
    const { notifierSNSTopic } = this.props.snsConstruct;

    const fn = new NodejsFunction(this, "function-notifier-send", {
      memorySize: 256,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
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
    });

    notifierSNSTopic.grantPublish(fn);

    const restApiId = StringParameter.fromStringParameterName(
      this,
      "parameter-xyz-api-d",
      "/apigateway/xyz-api-id"
    );

    const rootResourceId = StringParameter.fromStringParameterName(
      this,
      "parameter-xyz-api-resource-id",
      "/apigateway/xyz-api-resource-id"
    );

    const api = RestApi.fromRestApiAttributes(this, "api-xyz", {
      restApiId: restApiId.stringValue,
      rootResourceId: rootResourceId.stringValue,
    });

    const resource = api.root.addResource("notifications");

    resource.addMethod(
      "OPTIONS",
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Methods": true,
            },
          },
        ],
      }
    );

    const model = new Model(this, "model-notifications-post-request", {
      restApi: api,
      contentType: "application/json",
      description: "Model for notifications post request",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          notifications: {
            type: JsonSchemaType.ARRAY,
            minItems: 1,
            maxItems: 15,
            items: {
              type: JsonSchemaType.OBJECT,
              properties: {
                service: {
                  type: JsonSchemaType.STRING,
                  enum: ["EMAIL", "WHATSAPP"],
                },
                title: {
                  type: JsonSchemaType.STRING,
                  minLength: 1,
                  maxLength: 100,
                },
                message: {
                  type: JsonSchemaType.STRING,
                  minLength: 1,
                  maxLength: 500,
                },
              },
              required: ["service", "message", "title"],
            },
          },
        },
        required: ["notifications"],
      },
    });

    const validator = new RequestValidator(
      this,
      "notifications-Post-request-validator",
      {
        restApi: api,
        validateRequestBody: true,
      }
    );

    resource.addMethod("POST", new LambdaIntegration(fn), {
      requestModels: {
        "application/json": model,
      },
      requestValidator: validator,
    });

    return fn;
  }

  private createProcessFunction() {
    const { notifierEmailQueue, notifierWhatsappQueue } =
      this.props.sqsConstruct;

    const ACCOUNT_SID = StringParameter.fromStringParameterName(
      this,
      "parameter-account-sid",
      "/twilio/account-sid"
    );

    const AUTH_TOKEN = StringParameter.fromStringParameterName(
      this,
      "parameter-auth-token",
      "/twilio/auth-token"
    );

    const SENDER_PHONE = StringParameter.fromStringParameterName(
      this,
      "parameter-sender-phone",
      "/twilio/sender-phone"
    );

    const RECEIVER_PHONE = StringParameter.fromStringParameterName(
      this,
      "parameter-my-phone",
      "/twilio/my-number"
    );

    const SES_IDENTITY = StringParameter.fromStringParameterName(
      this,
      "parameter-ses-identity",
      "/ses/email-identity"
    );

    const SES_ARN_IDENTITY = StringParameter.fromStringParameterName(
      this,
      "parameter-ses-arn-identity",
      "/ses/arn-identity"
    );

    const fn = new NodejsFunction(this, "function-notifier-process", {
      memorySize: 256,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to process notifications",
      entry: join(__dirname, "../../../lambda/process-notification/handler.ts"),
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
    });

    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [SES_ARN_IDENTITY.stringValue],
        effect: Effect.ALLOW,
      })
    );

    fn.addEventSource(
      new SqsEventSource(notifierEmailQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );

    fn.addEventSource(
      new SqsEventSource(notifierWhatsappQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );

    notifierEmailQueue.grantConsumeMessages(fn);
    notifierWhatsappQueue.grantConsumeMessages(fn);

    return fn;
  }

  private createDlqFunction() {
    const { notifierDLQ } = this.props.sqsConstruct;
    const { alertSNSTopic } = this.props.snsConstruct;

    const fn = new NodejsFunction(this, "function-notifer-dlq", {
      memorySize: 256,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
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

    fn.addEventSource(
      new SqsEventSource(notifierDLQ, {
        batchSize: 10,
      })
    );

    alertSNSTopic.grantPublish(fn);

    notifierDLQ.grantConsumeMessages(fn);

    return fn;
  }
}
