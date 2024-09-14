import { Schema, model, Types } from 'mongoose';

export interface NumberContract {
    number: string,
    createdAt: Date,
}

const NumberSchema = new Schema<NumberContract>({
    createdAt: { type: Date, required: true, default: Date.now },
    number: { type: String, required: true },
});

export const Number = model<NumberContract>('Number', NumberSchema);