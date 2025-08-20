import { s3 } from "../_shared/infra/s3";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { userRepository } from "../_shared/repository/user.repository";

type Input = {
  userId: string;
  size: number;
  filename: string;
  endpoint: string;
};

export const service = async ({
  userId,
  size,
  filename,
  endpoint,
}: Input): Promise<{
  message: string;
  success: boolean;
  data: null | { url: string; key: string };
}> => {
  const preSignedUrl = await s3.createPresignedUrl({
    bucket: process.env.BUCKET_NAME as string,
  });

  const findUser = await userRepository.findBySub(userId);

  if (!findUser) {
    return { message: "User not found", success: false, data: null };
  }

  const checkMethod = await archiveRepository.getByEndpoint({
    endpoint,
    userId: findUser.id,
  });

  if (checkMethod) {
    return { message: "Endpoint already exists", success: false, data: null };
  }

  await archiveRepository.save({
    key: preSignedUrl.key,
    size,
    message: ``,
    status: "PENDING",
    userId: findUser.id,
    filename,
    endpoint,
  });

  return {
    message: "Presigned URL generated successfully",
    success: true,
    data: {
      url: preSignedUrl.url,
      key: preSignedUrl.key,
    },
  };
};
