import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { notifierProcessController, notifierProcessDLQController, notifierValidationController } from '../controllers';

export const notifierProcessHandler = async (event: SQSEvent) => await notifierProcessController(event);

export const notifierProcessDLQHandler = async (event: SQSEvent) => await notifierProcessDLQController(event);

export const notifierValidationHandler = (event: APIGatewayProxyEvent) => notifierValidationController(event);
