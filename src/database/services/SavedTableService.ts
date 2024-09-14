import { SavedTable, ISavedTable, ISavedTableState } from '../models/SavedTable'; // Обновите путь к вашему файлу модели
import { Types } from 'mongoose';

class SavedTableService {
    async createSavedTable(data: any): Promise<ISavedTable> {
        const savedTable = new SavedTable(data);
        return await savedTable.save();
    }

    async getSavedTableById(id: string): Promise<ISavedTable | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
        return await SavedTable.findById(id).populate('manager').exec();
    }

    async getTableByStatusAndManagerId(status: ISavedTableState, managerId: Types.ObjectId) {
        const table = await SavedTable.findOne({ status, manager: managerId }).populate('manager').exec();
        return table?.toObject();
    }

    async getAllSavedTables(managerId: string, filter: { manager?: string, status?: ISavedTableState, createdAt?: Date }): Promise<ISavedTable[]> {
        const query: any = { manager: managerId };

        // if (filter.manager) {
        //     const manager = await Manager.findOne({ login: filter.manager });
        //     query.manager = manager?._id;
        // }

        if (filter.status) {
            query.status = filter.status;
        }

        if (filter.createdAt) {
            query.createdAt = new Date(filter.createdAt);
        }

        return await SavedTable.find(query)
            .populate({
                path: 'manager',
                select: '-password' // Исключение поля password
            })
            .exec();
    }

    async updateTableFieldById(tableId: string, field: string) {
        const table = await SavedTable.findByIdAndUpdate(tableId, { $set: { data: field } }, { new: true }).exec();
        return table?.toObject();
    }

    async updateSavedTableById(managerId: string, id: string): Promise<ISavedTable | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }

        // Проверяем, есть ли уже запись с статусом 'Текущая'
        const currentRecord = await SavedTable.find({ manager: managerId, status: ISavedTableState.current });
        console.log('[DEBUG]', currentRecord)

        // Если нашли запись с таким статусом, изменяем её статус на 'База'
        if (currentRecord.length > 0) {
            for (const el of currentRecord) {
                if(String(el._id) === id) {
                    continue
                }
                await SavedTable.findByIdAndUpdate(el._id, { status: ISavedTableState.base });
            }
        }

        const currentTable = await SavedTable.findById(id);
        if (!currentTable) {
            return null;
        }

        currentTable.status = currentTable.status === ISavedTableState.current ? ISavedTableState.base : ISavedTableState.current;

        try {
            const updatedTable = await currentTable.save();
            console.log('outputTable: ', updatedTable, 'status: ', updatedTable.status);
            return updatedTable;
        } catch (error) {
            console.error('Error updating table status:', error);
            return null;
        }
    }

    async updateStatus(id: string, status: ISavedTableState) {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
        return await SavedTable.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }

    async deleteSavedTableById(id: string): Promise<ISavedTable | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
        return await SavedTable.findByIdAndDelete(id).exec();
    }
}

export default new SavedTableService();