import { Schema, model, Types } from 'mongoose';

export interface IRegion {
    _id: Types.ObjectId;
    name: string;
    country: string;
    code: string;
    createdAt: Date;
}

const RegionSchema = new Schema<IRegion>({
    createdAt: { type: Date, required: true, default: Date.now },
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    name: { type: String, required: true },
    country: { type: String, required: true },
    code: { type: String, required: false },
});

export const Region = model<IRegion>('Region', RegionSchema);