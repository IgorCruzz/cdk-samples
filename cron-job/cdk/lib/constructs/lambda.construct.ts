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
import { join } from "node:path";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export class LambdaConstruct extends Construct {
  public readonly cronJobFunction: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.cronJobFunction = this.createCronJobFunction();
  }

  private createCronJobFunction() {
    const fn = new NodejsFunction(this, "function-cron-job", {
      memorySize: 128,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      description: "A Lambda function to cron job",
      entry: join(__dirname, "../../../lambda/cron/handler.ts"),
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
      },
      loggingFormat: LoggingFormat.JSON,
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const rule = new Rule(this, "rule-cron-job", {
      schedule: Schedule.cron({
        minute: "0",
        hour: "14",
        month: "*",
        day: "*",
        year: "*",
      }),
    });

    rule.addTarget(new LambdaFunction(fn));

    return fn;
  }
}
