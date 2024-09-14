import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ProfileData } from './types';

export default class AvitoAPI {
  private token: string;
  private api: AxiosInstance;

  constructor(token: string) {
    this.token = token;
    this.api = axios.create({
      baseURL: 'https://api.avito.ru',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public async getProfile(): Promise<any> {
    try {
      const response = await this.api.get('/autoload/v1/profile');
      return response;
    } catch (error) {
      console.error(error)
      return error
    }
  }

  private validateProfileData(profileData: ProfileData): void {
    // Проверка обязательных полей
    if (typeof profileData.autoload_enabled !== 'boolean') {
      throw new Error('Field autoload_enabled is required and should be a boolean');
    }
    if (typeof profileData.report_email !== 'string') {
      throw new Error('Field report_email is required and should be a string');
    }
    if (!Array.isArray(profileData.schedule) || profileData.schedule.length === 0) {
      throw new Error('Field schedule is required and should be a non-empty array');
    }
    if (typeof profileData.upload_url !== 'string' || !/^https?:\/\//.test(profileData.upload_url)) {
      throw new Error('Field upload_url is required and should be a valid URL');
    }

    // Дополнительная проверка полей внутри schedule
    profileData.schedule.forEach((schedule, index) => {
      if (typeof schedule.rate !== 'number') {
        throw new Error(`Field rate in schedule[${index}] is required and should be a number`);
      }
      if (!Array.isArray(schedule.time_slots) || schedule.time_slots.some(slot => typeof slot !== 'number')) {
        throw new Error(`Field time_slots in schedule[${index}] is required and should be an array of numbers`);
      }
      if (!Array.isArray(schedule.weekdays) || schedule.weekdays.some(day => typeof day !== 'number')) {
        throw new Error(`Field weekdays in schedule[${index}] is required and should be an array of numbers`);
      }
    });
  }

  public async createOrUpdateProfile(profileData: ProfileData): Promise<any> {
    this.validateProfileData(profileData);

    try {
      const response = await this.api.post('/autoload/v1/profile', profileData);
      return response.status;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error("Axios error:", axiosError);
        if (axiosError.response) {
          console.error("Response data:", axiosError.response.data);
          console.error("Response status:", axiosError.response.status);
          console.error("Response headers:", axiosError.response.headers);
          throw new Error(`API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        }
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  public async getReportsV2(): Promise<any> {
    try {
      const response = await this.api.get('/autoload/v2/reports');
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async getReportByIdV2(reportId: string): Promise<any> {
    try {
      const response = await this.api.get(`/autoload/v2/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async getLastCompletedReport(): Promise<any> {
    try {
      const response = await this.api.get('/autoload/v2/reports/last-completed');
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async getAutoloadItemsInfoV2(adId: string): Promise<any> {
    try {
      const response = await this.api.get(`/autoload/v2/items/${adId}`);
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async upload(): Promise<AxiosResponse<any, any> | undefined> {
    const response = await this.api.post('/autoload/v1/upload');
    return response;
  }

  public async getAdIdsByAvitoIds(avitoId: string): Promise<any> {
    try {
      const response = await this.api.get(`/autoload/v1/ids/avito/${avitoId}`);
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async getAvitoIdsByAdIds(adId: string): Promise<any> {
    try {
      const response = await this.api.get(`/autoload/v1/ids/ad/${adId}`);
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }

  public async getReportItemsById(reportId: string): Promise<any> {
    try {
      const response = await this.api.get(`/autoload/v2/reports/${reportId}/items`);
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }
}
