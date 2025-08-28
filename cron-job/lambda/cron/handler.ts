import { service } from "./cron.service";

export const handler = async () => {
  return service();
};
