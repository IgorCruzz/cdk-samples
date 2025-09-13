import { dbHelper } from "../__shared/repository/client";
import { service } from "./cron.service";

export const handler = async () => {
  try {
    await dbHelper.connect();

    await service();
  } catch (error) {
    console.error(error);
  }
};
