import { IManager, Manager } from '../models/Manager';

export class ManagerRepository {
  async create(manager: { login: string; password: string; }): Promise<IManager> {
    const newManager = new Manager(manager);
    return await newManager.save();
  }

  async findById(id: string): Promise<IManager | null> {
    return await Manager.findById(id);
  }

  async findAll(): Promise<IManager[]> {
    return await Manager.find();
  }

  async update(id: string, manager: Partial<IManager>): Promise<IManager | null> {
    return await Manager.findByIdAndUpdate(id, manager, { new: true });
  }

  async findWhere(where: string) {
      const Managers = await Manager.find({ login: where }).exec();
      return Managers;
  }
}