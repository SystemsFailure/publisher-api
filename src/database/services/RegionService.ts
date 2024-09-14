import { Region } from '../models/Region';

export class RegionService {
    async getRegionById(id: string) {
        return await Region.findById(id);
    }

    async getAllRegion() {
        return await Region.find({});
    }

    async updateRegion(id: string, field: any) {
        return await Region.findByIdAndUpdate(id, field, { new: true });
    }

    async getRegionWhere(where: any) {
        return await Region.find( where ).exec();
    }
}