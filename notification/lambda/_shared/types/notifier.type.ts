export type NotifyType = {
  message: string;
  service: "EMAIL" | "SMS" | "WHATSAPP";
  title: string;
  toAddress: string;
};
