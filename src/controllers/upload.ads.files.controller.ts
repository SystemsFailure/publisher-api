import { Request, Response } from "express";
import crypto from 'crypto';
import S3Service from "../storage/s3/selectel.s3";
import { s3config } from '../../config';
import fs from 'fs';
import { FileService } from "../database/services/FileService";
import { getFileURL } from "../helpers/get.storage.path";

export function generateRandomId(): string {
    return crypto.randomBytes(16).toString('hex');
}

async function uploadFileToS3(s3Service: S3Service, file: Express.Multer.File, remoteS3Path: string): Promise<void> {
    await s3Service.uploadFile(file.path, remoteS3Path);
}

async function saveFileMetadata(fileService: FileService, platform: string, adId: string, file: Express.Multer.File, remoteS3Path: string): Promise<void> {
    await fileService.createFile({
        platform: platform,
        adId: adId,
        name: file.filename,
        localPath: file.path,
        storagePath: remoteS3Path,
        size: file.size,
        createdAt: new Date(),
    });
}

async function deleteLocalFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function handleFileUpload(s3Service: S3Service, fileService: FileService, file: Express.Multer.File, platform: string, adId: string): Promise<string> {
    const remoteS3Path = `files/ads/${platform}/${adId}/${generateRandomId()}_${file.originalname}`;
    await uploadFileToS3(s3Service, file, remoteS3Path);
    await saveFileMetadata(fileService, platform, adId, file, remoteS3Path);
    await deleteLocalFile(file.path);
    return remoteS3Path;
}

export const uploadAdsFilesController = async (req: Request, res: Response) => {
    const s3Service = new S3Service({
        endpoint: "https://s3.storage.selcloud.ru",
        accessKeyId: "482c592b6beb446f99d027b8d90efdf0",
        secretAccessKey: "7ce992a7ee6b4df9b4ba2d0f68a75aa3",
        bucketName: "ao-publisher",
    });
    const fileService = new FileService();
    const { adId, platform } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    try {
        const uploadPromises = files.map(file => handleFileUpload(s3Service, fileService, file, platform, adId));
        let uploadedPaths = await Promise.all(uploadPromises);
        const fileURLs = uploadedPaths.map(getFileURL);

        return res.status(200).json({ message: 'Files uploaded successfully', paths: fileURLs });
    } catch (error) {
        console.error('Error uploading files:', error);
        return res.status(500).json({ error: 'Error uploading files' });
    }
};