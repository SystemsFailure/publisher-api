import { Schema, model, Types } from 'mongoose';

export interface IFile {
  _id?: Types.ObjectId,
  platform: string;
  name: string;
  localPath: string;
  storagePath: string;
  size: number;
  adId: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  platform: { type: String, required: true },
  name: { type: String, required: true },
  localPath: { type: String, required: true, unique: true },
  storagePath: { type: String, required: true, unique: true },
  size: { type: Number, required: false },
  adId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const File = model<IFile>('File', FileSchema);