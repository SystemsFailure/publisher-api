import { Schema, model, Types } from 'mongoose';

export interface IOfficeCredentials {
    officeId: Types.ObjectId;
    regionId: Types.ObjectId;
    platform: string;
    credentials: string;
    createdAt?: Date;
}

const OfficeCredentialsSchema = new Schema<IOfficeCredentials>({
    createdAt: { type: Date, required: true, default: Date.now },
    officeId: { type: Schema.Types.ObjectId, required: true, ref: 'Office' },
    regionId: { type: Schema.Types.ObjectId, required: true, ref: 'Region' },
    platform: { type: String, required: true },
    credentials: { type: String, required: true },
});

export const OfficeCredentials = model<IOfficeCredentials>('OfficeCredentials', OfficeCredentialsSchema);