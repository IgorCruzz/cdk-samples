import { Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createVPC();
  }

  private createVPC() {
    const vpc = new Vpc(this, "vpc-1", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 0,
    });

    new StringParameter(this, "vpc-id-parameter", {
      parameterName: "/vpc/id",
      stringValue: vpc.vpcId,
    });

    vpc.isolatedSubnets.forEach((subnet, index) => {
      new StringParameter(this, `IsolatedSubnet${index + 1}`, {
        parameterName: `/vpc/isolated-subnet-${index + 1}`,
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
