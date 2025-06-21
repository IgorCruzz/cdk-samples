import { IArchiveRepository } from "../repository/archive.repository";

interface IGetFilesService {
  getFiles: () => Promise<string[]>;
}

export class GetFilesServices implements IGetFilesService {
  constructor(private readonly archiveRepository: IArchiveRepository) {}

  getFiles: () => Promise<string[]>;
}
