import { IOfficeCredentials, OfficeCredentials } from '../models/OfficeCredentials';

export class OfficeCredentialsService {
    async createOfficeCredentials(data: IOfficeCredentials) {
        const newOfficeCredentials = await OfficeCredentials.create({
            ...data,
            createdAt: new Date(),
        })
        return newOfficeCredentials.toObject();
    }

    async getOfficeCredentialsById(id: string) {
        return await OfficeCredentials.findById(id);
    }

    async getAllOfficeCredentials() {
        return await OfficeCredentials.find({});
    }

    async updateOfficeCredentials(id: string, field: any) {
        return await OfficeCredentials.findByIdAndUpdate(id, field, { new: true });
    }

    async getOfficeCredentialsWhere(where: any) {
        return await OfficeCredentials.find( where ).exec();
    }
}