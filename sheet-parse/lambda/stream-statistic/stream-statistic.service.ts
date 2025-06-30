import { DynamoDBStreamEvent } from "aws-lambda";

type StreamInput = DynamoDBStreamEvent;
type StreamOutput = Promise<void>;

interface IGetFilesService {
  stream: (input: DynamoDBStreamEvent) => StreamOutput;
}

export class StreamService implements IGetFilesService {
  stream = async (event: StreamInput): StreamOutput => {
    for (const record of event.Records) {
      const eventName = record.eventName;
      const oldImage = record.dynamodb?.OldImage;
      const newImage = record.dynamodb?.NewImage;

      if (eventName === "MODIFY") {
        continue;
      }

      console.log("Item foi modificado");
      console.log("Antes (OldImage):", JSON.stringify(oldImage));
      console.log("Depois (NewImage):", JSON.stringify(newImage));

      const oldStatus = oldImage?.status?.S;
      const newStatus = newImage?.status?.S;
      if (oldStatus !== newStatus) {
        console.log(`O status mudou de "${oldStatus}" para "${newStatus}"`);
      }
    }
  };
}
