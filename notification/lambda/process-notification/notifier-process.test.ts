import { service } from "../../process-notification/notifier-process.service";
import { mail } from "../../_shared/infra/mail";
import { twilio } from "../../_shared/infra/twilio";

jest.mock("../../_shared/infra/mail", () => ({
  mail: {
    sendMail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../_shared/infra/twilio", () => ({
  twilio: {
    sendWhatsAppMessage: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("processNotification", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should send email notification successfully", async () => {
    const records = [
      {
        messageId: "msg1",
        receiptHandle: "rh1",
        body: JSON.stringify({
          service: "EMAIL",
          email: "test@example.com",
          message: "Hello",
        }),
        attributes: {} as any,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "",
        awsRegion: "",
      },
    ];

    const response = await service({ records });

    expect(mail.sendMail).toHaveBeenCalledWith({
      service: "EMAIL",
      email: "test@example.com",
      message: "Hello",
    });
    expect(twilio.sendWhatsAppMessage).not.toHaveBeenCalled();
    expect(response.batchItemFailures).toHaveLength(0);
  });

  it("should send whatsapp notification successfully", async () => {
    const records = [
      {
        messageId: "msg2",
        receiptHandle: "rh2",
        body: JSON.stringify({
          service: "WHATSAPP",
          phoneNumber: "+5511999999999",
          message: "Hi",
        }),
        attributes: {} as any,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "",
        awsRegion: "",
      },
    ];

    const response = await service({ records });

    expect(twilio.sendWhatsAppMessage).toHaveBeenCalledWith({
      service: "WHATSAPP",
      phoneNumber: "+5511999999999",
      message: "Hi",
    });
    expect(mail.sendMail).not.toHaveBeenCalled();
    expect(response.batchItemFailures).toHaveLength(0);
  });
});
