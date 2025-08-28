import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createVPC();
  }

  private createVPC() {
    new Vpc(this, "vpc-1", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 0,
    });
  }
}
