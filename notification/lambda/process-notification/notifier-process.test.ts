import { service } from "../process-notification/notifier-process.service";
import { mail } from "../_shared/infra/mail";
import { twilio } from "../_shared/infra/twilio";

jest.mock("../_shared/infra/mail", () => ({
  mail: {
    sendMail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../_shared/infra/twilio", () => ({
  twilio: {
    sendWhatsAppMessage: jest.fn().mockResolvedValue(undefined),
  },
}));

const request = {
  records: [
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
  ],
};

describe("processNotification", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should send email notification successfully", async () => {
    await service(request);

    expect(mail.sendMail).toHaveBeenCalledWith({
      service: "EMAIL",
      email: "test@example.com",
      message: "Hello",
    });
    expect(twilio.sendWhatsAppMessage).not.toHaveBeenCalled();
  });

  it("should send whatsapp notification successfully", async () => {
    await service({
      records: [
        {
          messageId: "msg1",
          receiptHandle: "rh1",
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
      ],
    });

    expect(twilio.sendWhatsAppMessage).toHaveBeenCalledWith({
      service: "WHATSAPP",
      phoneNumber: "+5511999999999",
      message: "Hi",
    });
  });
});
