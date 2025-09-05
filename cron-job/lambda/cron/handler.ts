import { service } from "./cron.service";

export const handler = async () => {
  try {
    await service();
  } catch (error) {
    console.error(error);
  }
};
