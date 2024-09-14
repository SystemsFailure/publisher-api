import { Schema, model, Types } from 'mongoose';

export interface NumberManagerContract {
    managerId: Types.ObjectId,
    numberId: Types.ObjectId,
}

const NumberManagerSchema = new Schema<NumberManagerContract>({
    managerId: { type: Schema.Types.ObjectId, required: true },
    numberId: { type: Schema.Types.ObjectId, required: true },
});

export const NumberManager = model<NumberManagerContract>('NumberManager', NumberManagerSchema);