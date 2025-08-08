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
});
