import { IUserRepository, Users } from "../shared/repository/user.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type CreateUsersInput = Users;

type CreateUsersOutput = Promise<APIGatewayProxyResult>;

interface ICreateUsersService {
  create: (input: CreateUsersInput) => CreateUsersOutput;
}

export class CreateUsersServices implements ICreateUsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  create = async (data: CreateUsersInput): CreateUsersOutput => {
    try {
      const files = await this.userRepository.save(data);

      return {
        statusCode: 201,
        body: JSON.stringify(files),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Api-Key",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      };
    } catch (error) {
      console.log({ error });

      return {
        statusCode: 500,
        body: "Internal Server Error",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Api-Key",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      };
    }
  };
}
