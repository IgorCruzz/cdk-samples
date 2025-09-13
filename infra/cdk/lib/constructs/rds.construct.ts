import { Fn, RemovalPolicy } from "aws-cdk-lib";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
  Vpc,
  Port,
} from "aws-cdk-lib/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType,
} from "aws-cdk-lib/aws-rds";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class RdsConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createRdsInstance();
  }

  private createRdsInstance() {
    const vpcId = StringParameter.valueForStringParameter(this, "/vpc/id");

    const vpc = Vpc.fromVpcAttributes(this, "cron-job-vpc", {
      vpcId,
      availabilityZones: Fn.getAzs(),
      publicSubnetIds: [
        StringParameter.valueForStringParameter(this, "/vpc/public-subnet-1"),
        StringParameter.valueForStringParameter(this, "/vpc/public-subnet-2"),
      ],
    });

    const lambdaSgId = StringParameter.valueForStringParameter(
      this,
      "/cron-job/sg"
    );

    const lambdaSg = SecurityGroup.fromSecurityGroupId(
      this,
      "lambda-sg",
      lambdaSgId
    );

    const sgRds = new SecurityGroup(this, "sg-rds", {
      vpc,
      description: "Security Group do RDS",
      allowAllOutbound: true,
    });

    sgRds.addIngressRule(lambdaSg, Port.tcp(5432), "Allow Postgres access");

    new DatabaseInstance(this, "instance-rds", {
      securityGroups: [sgRds],
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_15,
      }),
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      storageType: StorageType.GP2,
      publiclyAccessible: true,
      multiAz: false,
      autoMinorVersionUpgrade: true,
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
