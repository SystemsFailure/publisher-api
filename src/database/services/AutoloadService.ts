import { IAutoloadData } from '../../types';
import { Autoload } from '../models/Autoload';
import { AutoloadRepository } from '../repositories/AutoloadRepository';

export class AutoloadService {
  private autoloadRepository: AutoloadRepository;

  constructor() {
    this.autoloadRepository = new AutoloadRepository();
  }

  async createAutoload(autoload: any): Promise<IAutoloadData> {
    // Add any additional validation or business logic here
    return await this.autoloadRepository.create(autoload);
  }

  async getAutoloadById(id: string): Promise<IAutoloadData | null> {
    return await this.autoloadRepository.findById(id);
  }

  async getAllAutoloads(): Promise<IAutoloadData[]> {
    return await this.autoloadRepository.findAll();
  }

  async updateAutoload(id: string, autoload: Partial<IAutoloadData>): Promise<IAutoloadData | null> {
    return await this.autoloadRepository.update(id, autoload);
  }

  async getAutoloadWhere(where: Record<string, any>) {
    return await Autoload.where(where).exec();
  }

  async deleteAutoload(id: string) {
    return await Autoload.deleteOne({ _id: id });
  }

  async getOldestAutoload() {
    try {
      const oldestRecord = await Autoload.findOne().sort({ publicatedAt: 1 }).exec();
      return oldestRecord;
    } catch (error) {
      console.error('Ошибка при получении самой старой записи:', error);
      throw error;
    }
  }
}