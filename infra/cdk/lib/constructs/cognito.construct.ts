import { Construct } from "constructs";
import {
  AccountRecovery,
  CfnUserPoolGroup,
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolIdentityProviderGoogle,
} from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

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

    const clienteId = StringParameter.fromStringParameterName(
      this,
      "parameter-client-id",
      "/google/client-id"
    );

    const clientSecret = StringParameter.fromStringParameterName(
      this,
      "parameter-client-secret",
      "/google/secret-id"
    );

    const googleProvider = new UserPoolIdentityProviderGoogle(
      this,
      "provider-google",
      {
        clientId: clienteId.stringValue,
        clientSecret: clientSecret.stringValue,
        userPool: this.userPool,
        scopes: ["openid", "profile", "email"],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      }
    );

    this.userPoolClient = new UserPoolClient(this, "user-pool-client", {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.GOOGLE,
        UserPoolClientIdentityProvider.COGNITO,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
        callbackUrls: ["https://api.igorcruz.space/v1/auth/oauth2"],
      },
    });

    this.userPoolClient.node.addDependency(googleProvider);

    new UserPoolDomain(this, "user-pool-domain", {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: `sheetparse`,
      },
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
