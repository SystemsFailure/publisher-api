import { IManager } from '../models/Manager';
import { ManagerRepository } from '../repositories/ManagerRepository';

export class ManagerService {
  private managerRepository: ManagerRepository;

  constructor() {
    this.managerRepository = new ManagerRepository();
  }

  async createManager(manager: { login: string; password: string }): Promise<IManager> {
    return await this.managerRepository.create(manager);
  }

  async getManagerById(id: string): Promise<IManager | null> {
    return await this.managerRepository.findById(id);
  }

  async getAllManagers(): Promise<IManager[]> {
    return await this.managerRepository.findAll();
  }

  async updateManager(id: string, manager: Partial<IManager>): Promise<IManager | null> {
    return await this.managerRepository.update(id, manager);
  }

  async getManagerWhere(where: string) {
    return await this.managerRepository.findWhere(where);
  }
}