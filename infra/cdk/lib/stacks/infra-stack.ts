import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CertificateConstruct,
  ApiConstruct,
  CognitoConstruct,
  VpcConstruct,
} from "../constructs";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new VpcConstruct(this, "construct-vpc");

    const { certificate } = new CertificateConstruct(
      this,
      "construct-certificate"
    );
    const { userPool, userPoolClient } = new CognitoConstruct(
      this,
      "construct-cognito"
    );

    new ApiConstruct(this, "construct-api", {
      certificate,
      userPool,
      userPoolClient,
    });
  }
}
