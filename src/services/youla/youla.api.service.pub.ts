import axios, { AxiosRequestConfig } from 'axios';
import { CreateFeedRequest, CreateFeedResponse, FeedResponse, LaunchData } from './types';

/**
 * Паттерн модуль
*/
export default class YoulaApiPubService {
    private url: string;
    private headers: AxiosRequestConfig;

    constructor(private token: string) {
        this.url = 'https://partner-api.youla.ru';

        this.headers = {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        };
    }

    private handleAxiosError(error: any) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data.message || 'Unknown error';
            switch (status) {
                case 400:
                    throw new Error(message);
                case 403:
                    throw new Error(`Forbidden: ${message}`);
                case 404:
                    throw new Error(message);
                case 422:
                    throw new Error(`Validation error: ${message}`);
                case 429:
                    throw new Error(`Rate Limit Error: ${message}`);
                default:
                    console.log("[ERROR DEFAULT]: ", error.response);
                    throw new Error(
                        `HTTP error ${status}: ${message}, response: ${error.response}`
                    );
            }
        } else {
            throw new Error('An error occurred while making the request');
        }
    }

    private async makeGetRequest(url: string, config?: AxiosRequestConfig) {
        try {
            const response = await axios.get(url, { ...this.headers, ...config });
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    private async makePostRequest(url: string, data: any, config?: AxiosRequestConfig) {
        try {
            const response = await axios.post(url, data, { ...this.headers, ...config });
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    private async makeDeleteRequest(url: string, config?: AxiosRequestConfig) {
        try {
            const response = await axios.delete(url, { ...this.headers, ...config });
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    async getFeeds(user_id: string, page: number = 1, per_page: number = 20) {
        const url = `${this.url}/feeds`;
        const params = { user_id, page, per_page };
        return await this.makeGetRequest(url, { params });
    }

    async getFeedData(feedID: string, userID: string) {
        const url = `${this.url}/feeds/${feedID}`;
        const params = { user_id: userID };
        return await this.makeGetRequest(url, { params });
    }

    async getLaunchData(id: string, userId: string): Promise<LaunchData> {
        const url = `${this.url}/launches/${id}`;
        const params = { user_id: userId };
        return await this.makeGetRequest(url, { params });
    }

    async createFeed(user_id: string, feedData: CreateFeedRequest): Promise<CreateFeedResponse> {
        const url = `${this.url}/feeds`;
        const data = { ...feedData };
        return await this.makePostRequest(url, data, { params: { user_id } });
    }

    async createPublication(feedID: string, userID: string) {
        const url = `${this.url}/feeds/${feedID}/publication`;
        return await this.makePostRequest(url, {}, { params: { user_id: userID } });
    }

    async deletePublication(id: string, userId: string): Promise<boolean> {
        const url = `${this.url}/publications/${id}`;
        return await this.makeDeleteRequest(url, { params: { user_id: userId } });
    }

    async deleteFeed(feedID: string, userID: string) {
        const url = `${this.url}/feeds/${feedID}`;
        return await this.makeDeleteRequest(url, { params: { user_id: userID } });
    }
}
