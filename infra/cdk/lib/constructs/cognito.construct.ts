import { Construct } from "constructs";
import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";

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

    new UserPoolClient(this, "user-pool-client", {
      userPool,
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
    });
  }
}
