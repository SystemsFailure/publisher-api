import { IAutoloadData } from "../types";

export function getProfileData(autoload: IAutoloadData, mailAddress: string, timeData: {
    rate: number,
    time_slots: number[],
    weekdays: number[],
} = {
        rate: 300,
        time_slots: [14],
        weekdays: [1]
    }) {
    return {
        agreement: true,
        autoload_enabled: true,
        report_email: mailAddress,
        schedule: [timeData],
        upload_url: String(autoload.storagePath),
    };
}