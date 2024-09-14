import { IAutoloadData } from '../../types';
import { Autoload } from '../models/Autoload';

export class AutoloadRepository {
  async create(autoload: IAutoloadData): Promise<IAutoloadData> {
    const newAutoload = new Autoload(autoload);
    return await newAutoload.save();
  }

  async findById(id: string): Promise<IAutoloadData | null> {
    return await Autoload.findById(id);
  }

  async findAll(): Promise<IAutoloadData[]> {
    return await Autoload.find();
  }

  async update(id: string, autoload: Partial<IAutoloadData>): Promise<IAutoloadData | null> {
    return await Autoload.findByIdAndUpdate(id, autoload, { new: true });
  }

  async findWhere(where: string = 'avito') {
    try {
      const autoloads = await Autoload.find({ platform: where }).exec();
      return autoloads;
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
  }
}