import { IAutoloadState } from "../../types";

export interface ReturnedSavedInStorage {
    storagePath: string;
    name: string;
    localPath: string;
};

export type DataSaveFileContract = {
    name?: string,
    subId?: string,
    managerId?: string,
    storagePath?: string,
    platform: string,
    countAds?: number | undefined,
    status: IAutoloadState,
    publicatedAt?: Date,
    createdAt: Date,
};

export interface FileContractParams {
    filePath: string;
    data: DataSaveFileContract;
}