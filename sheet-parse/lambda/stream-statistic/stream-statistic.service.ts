import { DynamoDBStreamEvent } from "aws-lambda";
import { IStatisticRepository } from "../repository/statistic.repository";

type StreamInput = DynamoDBStreamEvent;
type StreamOutput = Promise<void>;

interface IGetFilesService {
  stream: (input: DynamoDBStreamEvent) => StreamOutput;
}

export class StreamService implements IGetFilesService {
  constructor(private statisticRepository: IStatisticRepository) {}

  stream = async (event: StreamInput): StreamOutput => {
    for (const record of event.Records) {
      const eventName = record.eventName;
      const oldImage = record.dynamodb?.OldImage;
      const newImage = record.dynamodb?.NewImage;

      if (eventName !== "MODIFY") {
        continue;
      }

      const oldStatus = oldImage?.status?.S;
      const newStatus = newImage?.status?.S;

      if (oldStatus !== newStatus) {
        await this.statisticRepository.save({
          type: newStatus === "COMPLETED" ? "COMPLETED" : "FAILED",
        });
      }
    }
  };
}
