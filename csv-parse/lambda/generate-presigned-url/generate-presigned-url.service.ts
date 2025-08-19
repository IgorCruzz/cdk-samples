import { s3 } from "../_shared/infra/s3";
import { archiveRepository } from "../_shared/repository/archive.repository";
import { userRepository } from "../_shared/repository/user.repository";

export const service = async ({
  userId,
  size,
  filename,
  endpoint,
}: {
  userId: string;
  size: number;
  filename: string;
  endpoint: string;
}): Promise<{
  url: string;
  key: string;
}> => {
  const preSignedUrl = await s3.createPresignedUrl({
    bucket: process.env.BUCKET_NAME as string,
  });

  const findUser = await userRepository.findBySub(userId);

  if (!findUser) {
    throw new Error("User not found");
  }

  const checkMethod = await archiveRepository.getByEndpoint({
    endpoint,
    userId,
  });

  if (checkMethod) {
    throw new Error("Endpoint already exists");
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
    url: preSignedUrl.url,
    key: preSignedUrl.key,
  };
};
