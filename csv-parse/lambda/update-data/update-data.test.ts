import { service } from "../update-data/update-data.services";
import { dataRepository } from "../_shared/repository/data.repository";

jest.mock("../_shared/repository/data.repository", () => ({
  dataRepository: {
    updateData: jest.fn(),
  },
}));

describe("UpdateData", () => {
  it("should be defined", async () => {
    expect(service).toBeDefined();
  });

  it("should be able to call updateData", async () => {
    await service(
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
