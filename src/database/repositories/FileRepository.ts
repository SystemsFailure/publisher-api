import { IFile, File } from '../models/File';
import { Types } from 'mongoose';

export class FileRepository {
  async create(file: IFile): Promise<IFile> {
    const newFile = new File(file);
    return await newFile.save();
  }

  async findById(id: string): Promise<IFile | null> {
    return await File.findById(id);
  }

  async findAll(): Promise<IFile[]> {
    return await File.find();
  }

  async update(id: string, file: Partial<IFile>): Promise<IFile | null> {
    return await File.findByIdAndUpdate(id, file, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<any> {
    return await File.deleteOne(id);
  }
}