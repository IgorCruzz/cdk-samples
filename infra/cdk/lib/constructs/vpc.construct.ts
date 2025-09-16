import { Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createVPC();
  }

  private createVPC() {
    const vpc = new Vpc(this, "vpc-app", {
      cidr: "10.1.0.0/16",
      maxAzs: 2,
      natGateways: 2,
    });

    new StringParameter(this, "vpc-id-parameter", {
      parameterName: "/vpc/id",
      stringValue: vpc.vpcId,
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      new StringParameter(this, `PrivateSubnet${index + 1}`, {
        parameterName: `/vpc/private-subnet-${index + 1}`,
        stringValue: subnet.subnetId,
      });
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      new StringParameter(this, `public-subnet-${index + 1}`, {
        parameterName: `/vpc/public-subnet-${index + 1}`,
        stringValue: subnet.subnetId,
      });
    });
  }
}
