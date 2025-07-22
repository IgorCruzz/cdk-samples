import { s3 } from "../shared/infra/s3";
import { archiveRepository } from "../shared/repository/archive.repository";
import { userRepository } from "../shared/repository/user.repository";

export const service = async (
  userId: string,
  size: number,
  filename: string
): Promise<{
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

  await archiveRepository.save({
    key: preSignedUrl.key,
    size,
    message: ``,
    status: "PENDING",
    userId: findUser.id,
    filename,
  });

  return {
    url: preSignedUrl.url,
    key: preSignedUrl.key,
  };
};
