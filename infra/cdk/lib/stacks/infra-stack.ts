import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CertificateConstruct,
  ApiConstruct,
  CognitoConstruct,
} from "../constructs";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
