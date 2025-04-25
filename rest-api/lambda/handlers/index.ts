import { NotifierProcessController, NotifierProcessDLQController, NotifierValidationController } from '../controllers';
import { NotifierProcessService, NotifierProcessDLQService, NotifierValidationService } from '../services';
import { NotifierRepository } from '../repositories';
import { SnsAdapter } from '../adapters';
import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';

export const notifierProcessHandler = (event: SQSEvent) => {
    const repository = new NotifierRepository();
    const service = new NotifierProcessService(repository);
    const controller = new NotifierProcessController(service);

    return controller.handler(event);
};

export const notifierProcessDLQHandler = (event: SQSEvent) => {
    const service = new NotifierProcessDLQService();
    const controller = new NotifierProcessDLQController(service);

    return controller.handler(event);
};
export const notifierValidationHandler = (event: APIGatewayProxyEvent) => {
    const adapter = new SnsAdapter();
    const service = new NotifierValidationService(adapter);
    const controller = new NotifierValidationController(service);

    return controller.handler(event);
};
