import { Construct } from "constructs";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class Route53Construct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createHostedZone();
  }

  private createHostedZone(): IHostedZone {
    const hostedZone = new HostedZone(this, "HostedZone", {
      zoneName: "igorcruz.space",
    });

    new StringParameter(this, "HostedZoneIdParameter", {
      parameterName: "/route53/hosted-zone-arn",
      stringValue: hostedZone.hostedZoneArn,
    });

    return hostedZone;
  }
}
