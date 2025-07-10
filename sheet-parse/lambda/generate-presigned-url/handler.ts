import { service } from "./generate-presigned-url.service";

export const generatePreSignedUrlHandler = async () => {
  return await service();
};
