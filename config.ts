import dotenv from 'dotenv';

// import * as path from 'path';

const result = dotenv.config();

console.log(process.env.S3_ENDPOINT); // Должно напечатать значение S3_ENDPOINT

if (result.error) {
  throw new Error(`Ошибка загрузки .env файла: ${result.error.message}`);
}

if (!process.env.S3_ENDPOINT || !process.env.S3_PUB_KEY || !process.env.S3_SECRET_KEY || !process.env.S3_BUCKET_NAME) {
  throw new Error('Отсутствуют необходимые переменные окружения');
}

interface S3ServiceConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

interface MailTrapConfig {
  host: string,
  port: number,
  auth: {
    user: string,
    pass: string
  }
}

export const s3config: S3ServiceConfig = {
  endpoint: process.env.S3_ENDPOINT!,
  accessKeyId: process.env.S3_PUB_KEY!,
  secretAccessKey: process.env.S3_SECRET_KEY!,
  bucketName: process.env.S3_BUCKET_NAME!
};

export const mailtrapConfig: MailTrapConfig = {
  host: process.env.MAILTRAP_HOST!,
  port: Number(process.env.MAILTRAP_PORT!),
  auth: {
    user: process.env.MAILTRAP_USER!,
    pass: process.env.MAILTRAP_PASSWORD!,
  }
}

export const avitoApiConfig = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
}

export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION