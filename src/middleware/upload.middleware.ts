import multer from "multer";

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadMiddleware = upload.single('file');