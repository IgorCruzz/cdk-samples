import { service } from "../confirm/confirm.services";
import { cognito } from "../_shared/infra/cognito";

jest.mock("../_shared/infra/cognito", () => ({
  cognito: {
    confirmSignup: jest.fn(),
  },
}));

const request = {
  email: "test@example.com",
  code: "123456",
};

describe("Confirm Service", () => {
  it("should be able to call confirmSignup", async () => {
    (cognito.confirmSignup as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await service(request);

    expect(cognito.confirmSignup).toHaveBeenCalledWith({
      email: "test@example.com",
      code: "123456",
    });
  });

  it("throws an error if confirmSignup fails", async () => {
    (cognito.confirmSignup as jest.Mock).mockResolvedValueOnce({
      error: "Invalid confirmation code",
      success: false,
    });

    const svc = await service(request);

    expect(svc).toEqual({
      message: "Invalid confirmation code",
      success: false,
      data: null,
    });
  });

  it("returns success message on successful confirmation", async () => {
    cognito.confirmSignup = jest.fn().mockResolvedValueOnce({
      error: null,
      success: true,
    });

    const svc = await service(request);

    expect(svc).toEqual({
      message: "Account confirmed successfully",
      success: true,
      data: null,
    });
  });
});
