import { Schema, model } from 'mongoose';
import { IAutoloadData } from '../../types';

const AutoloadSchema = new Schema<IAutoloadData>({
    subId: {type: String, default: '', required: false},
    managerId: { type: String, default: '', required: false },
    feedName: { type: String, default: '', required: false },
    platform: { type: String, required: true },
    name: { type: String, required: true },
    countAds: { type: Number, required: false },
    storagePath: { type: String, required: true },
    status : { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    publicatedAt: { type: Date, required: false, default: Date.now },
});

export const Autoload = model<IAutoloadData>('Autoload', AutoloadSchema);