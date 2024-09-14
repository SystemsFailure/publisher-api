import { Schema, model, Types, Document } from 'mongoose';

// Определение перечисления (enum) для ролей
export enum Role {
  MANAGER = 'Маркетолог',
  CHIEF_MANAGER = 'Главный маркетолог',
  ADMIN = 'Админ',
}

// Интерфейс для менеджера с ролью
export interface IManager extends Document {
  _id?: Types.ObjectId;
  login: string;
  password: string;
  createdAt: Date;
  role: Role; // Добавление поля для роли
}

export interface IManager extends Document {
  _id?: Types.ObjectId;
  login: string;
  password: string;
  createdAt: Date;
}

const ManagerSchema = new Schema<IManager>({
  _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  role: {
    type: String,
    enum: Object.values(Role), // Указываем, что значение должно быть одним из перечисленных
    required: true,
    default: Role.MANAGER // Значение по умолчанию
  },
});

export const Manager = model<IManager>('Manager', ManagerSchema);
