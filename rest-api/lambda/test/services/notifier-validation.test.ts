import { ISnsAdapter } from '../../adapters';
import { NotifierValidationService } from '../../services';

let notifierValidationService: NotifierValidationService;
let snsAdapterStub: ISnsAdapter;

class SnsAdapterStub implements ISnsAdapter {
    publishMessage = async () => {
        Promise.resolve();
    };
}

describe('NotifierProcessService', () => {
    beforeAll(() => {
        snsAdapterStub = new SnsAdapterStub();
        notifierValidationService = new NotifierValidationService(snsAdapterStub);
    });

    it('should be defined', async () => {
        expect(notifierValidationService).toBeDefined();
    });
});
