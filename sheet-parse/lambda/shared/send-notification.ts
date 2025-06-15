export interface ISendNotification {
  send(message: sendNotificationInput): Promise<sendNotificationOutput>;
}

export type sendNotificationInput = {
  message: string;
};

export type sendNotificationOutput = Response;

export class SendNotification implements ISendNotification {
  send = async (
    message: sendNotificationInput
  ): Promise<sendNotificationOutput> => {
    const response = await fetch(`${process.env.API_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_KEY || "",
      },
      body: JSON.stringify({
        notifications: [
          {
            service: "EMAIL",
            title: "File processed",
            message,
          },
          {
            service: "WHATSAPP",
            title: "File processed",
            message,
          },
        ],
      }),
    });

    return response;
  };
}
