import { service } from "../create-data/create-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    singleSave: jest.fn(),
  },
}));

describe("createData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call singleSave", async () => {
    await service({
      nome: "Teixeira Cardoso - ME",
      cnpj: "23.579.041/0001-80",
      email: "rodrigueslivia@azevedo.com",
      telefone: "(40) 6977-4635",
      endereco: "Jardim de Mendes, 18",
      cidade: "Belém",
      estado: "MT",
      cep: "50588-358",
      archiveId: "68a3b89d64b9a8037c97582d",
    });

    expect(dataRepository.singleSave).toHaveBeenCalledWith({
      nome: "Teixeira Cardoso - ME",
      cnpj: "23.579.041/0001-80",
      email: "rodrigueslivia@azevedo.com",
      telefone: "(40) 6977-4635",
      endereco: "Jardim de Mendes, 18",
      cidade: "Belém",
      estado: "MT",
      cep: "50588-358",
      archiveId: "68a3b89d64b9a8037c97582d",
    });
  });

  it("should be able to return success if data was added", async () => {
    const svc = await service({
      nome: "Teixeira Cardoso - ME",
      cnpj: "23.579.041/0001-80",
      email: "rodrigueslivia@azevedo.com",
      telefone: "(40) 6977-4635",
      endereco: "Jardim de Mendes, 18",
      cidade: "Belém",
      estado: "MT",
      cep: "50588-358",
      archiveId: "68a3b89d64b9a8037c97582d",
    });

    expect(svc).toEqual({
      message: "Data created successfully",
      success: true,
      data: null,
    });
  });
});
