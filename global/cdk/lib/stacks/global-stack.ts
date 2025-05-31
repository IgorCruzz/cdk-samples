import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiConstruct} from '../constructs/api.construct'

export class GlobalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ApiConstruct(this, 'GlobalApi')    
  }
}
