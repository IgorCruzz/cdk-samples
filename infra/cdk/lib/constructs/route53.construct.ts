import { Construct } from "constructs";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";

export class Route53Construct extends Construct {
  public readonly hostedZone: IHostedZone;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.hostedZone = this.createHostedZone();
  }

  private createHostedZone(): IHostedZone {
    return new HostedZone(this, "HostedZone", {
      zoneName: "igorcruz.space",
    });
  }
}
