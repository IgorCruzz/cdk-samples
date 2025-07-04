import { Construct } from "constructs";
import { DatabaseCluster, StorageType } from "aws-cdk-lib/aws-docdb";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { RemovalPolicy } from "aws-cdk-lib";

export class DocumentDBConstruct extends Construct {
  public readonly cluster: DatabaseCluster;
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { cluster, docdbSG } = this.createDocumentDBInstance();

    this.cluster = cluster;
    this.securityGroup = docdbSG;
  }

  private createDocumentDBInstance() {
    const vpc = Vpc.fromLookup(this, "vpc-default", {
      isDefault: true,
    });

    const docdbSG = new SecurityGroup(this, "sg-docdb", { vpc });

    const cluster = new DatabaseCluster(this, "database", {
      masterUser: {
        username: "test",
      },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      instances: 1,
      storageType: StorageType.STANDARD,
      securityGroup: docdbSG,
    });
    return { docdbSG, cluster };
  }
}
