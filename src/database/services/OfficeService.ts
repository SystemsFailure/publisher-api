import { Office } from '../models/Office';

export class OfficeService {
    async getOfficeById(id: string) {
        return Office.findById(id);
    }

    async getAllOffice() {
        return Office.find();
    }

    async updateOffice(id: string, field: any) {
        return Office.findByIdAndUpdate(id, field, { new: true });
    }

    async getOfficeWhere(where: string) {
        return Office.find({ region: where }).exec();
    }
}