export interface ProfileData {
    agreement?: boolean;
    autoload_enabled: boolean;
    report_email: string;
    schedule: Array<ExportSchedule>;
    upload_url: string;
}

export interface ExportSchedule {
    rate: number;
    time_slots: number[];
    weekdays: number[];
}

export interface ProfileData {
    agreement?: boolean;
    autoload_enabled: boolean;
    report_email: string;
    schedule: ExportSchedule[];
    upload_url: string;
}