import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiConstruct} from '../constructs/api.construct'

export class GlobalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new ApiConstruct(this, 'XyzApi')   
    
    new CfnOutput(this, 'XyzApiOutput', {
      value: api.xyzApi.restApiId, 
      exportName: 'XyzApiId'
    })
  }
}
