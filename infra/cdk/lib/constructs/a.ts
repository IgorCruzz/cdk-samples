import { Construct } from "constructs";
import { ApiKey } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiConstructProps {
  sheetParseFunction: IFunction;
}

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string, readonly props: ApiConstructProps) {
    super(scope, id);
    this.apiKey();
  }

  private apiKey() {
    new ApiKey(this, "api-key-sheet-parse", {
      apiKeyName: "sheet-parse-api-key",
      description: "API key for secure services",
      enabled: true,
    });
  }
}
