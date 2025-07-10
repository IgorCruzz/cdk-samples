import { service } from "./generate-presigned-url.service";

export const handler = async () => {
  return await service();
};
