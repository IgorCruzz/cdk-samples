import { NotifierProcessDLQService, NotifierProcessDLQServiceInterface } from '../services';

let notifierProcessDLQService: NotifierProcessDLQServiceInterface;

describe('Notifier Process DLQ', () => {
    beforeAll(() => {
        notifierProcessDLQService = new NotifierProcessDLQService();
    });

    it('should be defined', () => {
        expect(notifierProcessDLQService).toBeDefined();
    });
});
