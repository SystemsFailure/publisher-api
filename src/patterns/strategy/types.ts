export interface PublisherStrategy {
    convert(adsData: any, modeExcel: boolean): any;
    valid(filePath?: string): any;
    publish(data: any, managerId?: string, adsCount?: number, feedName?: string): any;
}

export interface IFileData {
    storagePath: string,
    name: string,
    localPath: string,
    size: number
}

export interface CustomPublicParamsContract {
    autoloadInstance: {
        platform: string,
        name: string,
        countAds: number,
    },
    path: string,
}