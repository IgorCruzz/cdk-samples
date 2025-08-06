import { service } from "../../confirm/confirm.services";
import { cognito } from "../../_shared/infra/cognito";

jest.mock("../../_shared/infra/cognito", () => ({
  cognito: {
    confirmSignup: jest.fn(),
  },
}));

describe("Confirm Service", () => {
  it("should be able to call confirmSignup", async () => {
    (cognito.confirmSignup as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await service({
      email: "test@example.com",
      code: "123456",
    });

    expect(cognito.confirmSignup).toHaveBeenCalledWith({
      email: "test@example.com",
      code: "123456",
    });
  });
});
