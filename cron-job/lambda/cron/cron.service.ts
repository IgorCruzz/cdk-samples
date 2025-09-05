import { driverRepository } from "../__shared/repository/driver.repository";

export const service = async () => {
  const expiredDrivers = await driverRepository.getExpiredDrivers();

  if (!expiredDrivers.length) return;

  console.log({ expiredDrivers });
};
