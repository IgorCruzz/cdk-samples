import { service } from "./generate-presigned-url.service";

export const handler = async () => {
  try {
    const preSignedUrl = await service();

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: preSignedUrl.url,
        key: preSignedUrl.key,
      }),
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
