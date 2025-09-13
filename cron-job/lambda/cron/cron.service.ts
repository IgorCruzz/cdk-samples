import { driverRepository } from "../__shared/repository/driver.repository";

export const service = async () => {
  console.log("Starting expired drivers check...");

  const expiredDrivers = await driverRepository.getExpiredDrivers();

  if (!expiredDrivers.length) {
    console.log("No expired drivers found.");
  }

  console.log({ expiredDrivers });
};
