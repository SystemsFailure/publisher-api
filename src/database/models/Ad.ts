import { Schema, model, Types } from 'mongoose';

export interface IAd {
    _id: Types.ObjectId;
    platform: string;
    data: any;
    countFiles?: number;
    createdAt: Date;
}

const AdSchema = new Schema<IAd>({
    platform: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    countFiles: { type: Number, required: false },
    createdAt: { type: Date, required: true, default: Date.now },
});

export const Ad = model<IAd>('Ad', AdSchema);