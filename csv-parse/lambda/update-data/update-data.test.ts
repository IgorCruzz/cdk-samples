import { service } from "../update-data/update-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    updateData: jest.fn(),
  },
}));

jest.mock("../_shared/repository/archive.repository", () => ({
  archiveRepository: {
    getByEndpoint: jest.fn().mockResolvedValue({
      key: "file-key-1",
      size: 12345,
      endpoint: "endpoint",
      message: "File processed",
      status: "COMPLETED",
      userId: "user-id-1",
      id: "68a3b89d64b9a8037c97582d",
      filename: "file1.csv",
    }),
  },
}));

const request = {
  data: {
    nome: "Teixeira Cardoso - ME",
    cnpj: "23.579.041/0001-80",
    email: "rodrigueslivia@azevedo.com",
    telefone: "(40) 6977-4635",
    endereco: "Jardim de Mendes, 18",
    cidade: "Belém",
    estado: "MT",
    cep: "50588-358",
  },
  id: "awesome-id",
};

describe("UpdateData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call updateData", async () => {
    await service(request);

    expect(dataRepository.updateData).toHaveBeenCalledWith(
      {
        nome: "Teixeira Cardoso - ME",
        cnpj: "23.579.041/0001-80",
        email: "rodrigueslivia@azevedo.com",
        telefone: "(40) 6977-4635",
        endereco: "Jardim de Mendes, 18",
        cidade: "Belém",
        estado: "MT",
        cep: "50588-358",
      },
      "awesome-id"
    );
  });
});
