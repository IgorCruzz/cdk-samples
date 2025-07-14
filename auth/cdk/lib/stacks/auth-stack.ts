import { Stack, StackProps } from 'aws-cdk-lib'; 
import { Construct } from 'constructs';
import { LambdaConstruct, ApiConstruct } from '../constructs';  

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props); 

    const lambdaContruct = new LambdaConstruct(this, 'construct-lambda');

    new ApiConstruct(this, 'construct-api', {
       signinFunction: lambdaContruct.signinFunction,
    });
  }
}
