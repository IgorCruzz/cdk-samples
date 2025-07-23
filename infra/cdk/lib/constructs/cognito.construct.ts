import { Construct } from "constructs";
import {
  AccountRecovery,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Duration } from "aws-cdk-lib";

export class CognitoConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new UserPool(this, "user-pool", {
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

    const groups = ["admin", "user"];

    for (const [index, name] of groups.entries()) {
      new CfnUserPoolGroup(this, `${name}Group`, {
        userPoolId: this.userPool.userPoolId,
        groupName: name,
        precedence: index + 1,
        description: `${name} group`,
      });
    }

    this.userPoolClient = new UserPoolClient(this, "user-pool-client", {
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
      accessTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.hours(8),
    });

    new StringParameter(this, "user-pool-id", {
      parameterName: "/cognito/user-pool-id",
      stringValue: this.userPool.userPoolId,
    });

    new StringParameter(this, "user-pool-client-id", {
      parameterName: "/cognito/user-pool-client-id",
      stringValue: this.userPoolClient.userPoolClientId,
    });
  }
}
