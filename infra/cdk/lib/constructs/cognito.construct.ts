import { Construct } from "constructs";
import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class CognitoConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new UserPool(this, "user-pool", {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });

    const client = new UserPoolClient(this, "user-pool-client", {
      userPool,
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
    });

    new StringParameter(this, "user-pool-client-id", {
      parameterName: "/cognito/user-pool-client-id",
      stringValue: client.userPoolClientId,
    });
  }
}
