import { FileRepository } from '../repositories/FileRepository';
import { File, IFile } from '../models/File';
import { Ad } from '../models/Ad';
import { Types } from 'mongoose';

export class FileService {
  private fileRepository: FileRepository;

  constructor() {
    this.fileRepository = new FileRepository();
  }

  async createFile(file: IFile): Promise<IFile> {
    // Add any additional validation or business logic here
    return await this.fileRepository.create(file);
  }

  async getFileById(id: string): Promise<IFile | null> {
    return await this.fileRepository.findById(id);
  }

  async getAllFiles(filter: {
    adId?: string,
    platform?: string,
  }): Promise<IFile[]> {
    // return await this.fileRepository.findAll();

    const query: any = {};

    if (filter.adId) {
      const ad = await Ad.findOne({ _id: filter.adId });
      if (!ad) {
        console.error("Объявление с данным id не было найдено ".concat(filter.adId));
      }
      query.adId = ad?._id;
    }

    if (filter.platform) {
      query.platform = filter.platform;
    }

    // // if (filter.createdAt) {
    // //   query.createdAt = new Date(filter.createdAt);
    // // }

    return await File.find(query).exec();
  }

  async updateFile(id: string, file: Partial<IFile>): Promise<IFile | null> {
    return await this.fileRepository.update(id, file);
  }

  //   async deleteUser(id: string): Promise<IFile | null> {
  //     return await this.fileRepository.delete(id);
  //   }

  async deleteFile(id: Types.ObjectId): Promise<boolean> {
    const deleted = await this.fileRepository.delete(id);
    return !!deleted;
  }
}