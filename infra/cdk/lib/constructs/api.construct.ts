import { Construct } from "constructs";
import { ApiKey } from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.apiKey();
  }

  private apiKey() {
    const apiKey = new ApiKey(this, "api-key-sheet-parse", {
      apiKeyName: "sheet-parse-api-key",
      description: "API key for secure services",
      enabled: true,
    });

    new StringParameter(this, "parameter-api", {
      stringValue: apiKey.keyId,
      parameterName: "/api/api-key",
    });

    return;
  }
}
