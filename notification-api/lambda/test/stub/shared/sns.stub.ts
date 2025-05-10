import { SNSSAdapterInterface } from '../../../shared';

export class SNSSAdapterStub implements SNSSAdapterInterface {
    publishBatchMessage = async () => {
        return Promise.resolve();
    };

    publishMessage = async () => {
        return Promise.resolve();
    };
}
