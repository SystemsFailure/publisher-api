import { Schema, model, Types } from 'mongoose';

export interface IManagerOffice {
    managerId: Types.ObjectId;
    officeId: Types.ObjectId;
}

const ManagerOfficeSchema = new Schema<IManagerOffice>({
    managerId: { type: Schema.Types.ObjectId, required: true, ref: 'Manager' },
    officeId: { type: Schema.Types.ObjectId, required: true, ref: 'Office' },
});

// Установка индекса для оптимизации
ManagerOfficeSchema.index({ managerId: 1, officeId: 1 }, { unique: true });

export const ManagerOffice = model<IManagerOffice>('ManagerOffice', ManagerOfficeSchema);
