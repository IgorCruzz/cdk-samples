import { IArchiveRepository, Files } from "../repository/archive.repository";

interface IGetFilesService {
  getFiles: () => Promise<GetFilesOutput>;
}

type GetFilesOutput = Files[];

export class GetFilesServices implements IGetFilesService {
  constructor(private readonly archiveRepository: IArchiveRepository) {}

  getFiles = async (): Promise<GetFilesOutput> => {
    return await this.archiveRepository.getFiles();
  };
}
