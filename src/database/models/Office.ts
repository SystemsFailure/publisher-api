import { Schema, model, Types } from 'mongoose';

export interface IOffice {
    _id: Types.ObjectId;
    region: Types.ObjectId;
    code: string;
    name: string;
    address: string;
    createdAt: Date;
}

const OfficeSchema = new Schema<IOffice>({
    createdAt: { type: Date, required: true, default: Date.now },
    code: { type: String, required: false, unique: true },
    name: { type: String, required: true },
    region: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
    address: { type: String, required: true },
});

export const Office = model<IOffice>('Office', OfficeSchema);
