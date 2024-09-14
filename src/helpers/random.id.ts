import { createHash, randomBytes } from "crypto";

export function generateUniqueId(): string {
    const randomData: string = randomBytes(16).toString('hex'); // Генерация рандомных данных
    const hash: string = createHash('sha256').update(randomData).digest('hex'); // Создание SHA-256 хэша
    return hash;
}