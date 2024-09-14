import { Schema, model, Document, Types } from 'mongoose';

export enum ISavedTableState {
    current = 'Текущая',
    base = 'База',
}

export interface ISavedTable extends Document {
    _id?: Types.ObjectId;
    data: any;
    status: ISavedTableState;
    manager: Schema.Types.ObjectId;
    createdAt?: Date;
}

const SavedTableSchema = new Schema<ISavedTable>({
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    status: { type: String, required: true, default: ISavedTableState.base },
    data: { type: Schema.Types.Mixed, required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'Manager', required: true },
    createdAt: { type: Date, default: Date.now, required: true },
});

export const SavedTable = model<ISavedTable>('SavedTable', SavedTableSchema);