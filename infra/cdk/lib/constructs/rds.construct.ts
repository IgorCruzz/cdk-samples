import { Fn, RemovalPolicy } from "aws-cdk-lib";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType,
} from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
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
    });

    new DatabaseInstance(this, "instance-rds", {
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
