import { commonSaveFile } from "../../patterns/utility";
import { IAutoloadState } from "../../types";

export const runPublic = async (filePath: string, platform: string, managerId?: string, adsCount?: number, feedName?: string) => {
    try {
        const data = {
            platform: platform,
            managerId: managerId,
            feedName: feedName,
            countAds: adsCount,
            status: IAutoloadState.pending,
            createdAt: new Date(),
            publicatedAt: new Date(),
        }
        
        console.log("[DEBUG runPublic]: ", data);

        const row = await commonSaveFile({ filePath, data })

        return row;
    } catch (error) {
        console.error(error)
    }
}