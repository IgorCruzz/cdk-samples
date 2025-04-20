import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TableV2, Billing, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

export class DynamoStack extends Stack {
    public readonly notifierTable: TableV2;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.notifierTable = this.createNotifierTable();
    }

    private createNotifierTable() {
        return new TableV2(this, 'notifierTable', {
            tableName: 'notifierTable',
            partitionKey: { name: 'PK', type: AttributeType.STRING },
            sortKey: { name: 'SK', type: AttributeType.STRING },
            globalSecondaryIndexes: [
                {
                    indexName: 'GSI1',
                    partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
                    sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
                    projectionType: ProjectionType.ALL,
                },
            ],
            billing: Billing.onDemand(),
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }
}
