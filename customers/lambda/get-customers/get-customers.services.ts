import {
  customersRepository,
  Customers,
} from "../shared/repository/customer.repository";
import { Output } from "../shared/service/output";

export const service = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Output<{
  itens: Customers[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const files = await customersRepository.getCustomers({
    page,
    limit,
  });

  return {
    message: "Customers retrieved successfully",
    data: files,
    success: true,
  };
};
