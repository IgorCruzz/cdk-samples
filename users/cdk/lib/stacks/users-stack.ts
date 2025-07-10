import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiConstruct, LambdaConstruct } from "../constructs";

export class UsersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaConstruct = new LambdaConstruct(this, "construct-lambda");

    new ApiConstruct(this, "construct-api", {
      updateUserFunction: lambdaConstruct.updateUserFunction,
      createUserFunction: lambdaConstruct.createUserFunction,
      getUsersFunction: lambdaConstruct.getUsersFunction,
      deleteUserFunction: lambdaConstruct.deleteUserFunction,
    });
  }
}
