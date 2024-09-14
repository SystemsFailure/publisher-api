import axios, { AxiosError } from 'axios';

export interface CreateFeedRequest {
    category_id: string;
    scheme_id: string;
    title: string;
    url: string;
    user_contact_id: string;
}

export default class YoulaServiceApi {
    protected apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || "http://partner-api.youla.ru/feeds";
    }

    public async createFeed(user_id: string, request: CreateFeedRequest): Promise<void> {

        try {
            const response = await axios.post(this.apiUrl, request, {
                params: { user_id },
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            this.handleAxiosError(error);
        }
    }
    private handleAxiosError(error: AxiosError) {
        if (error.response) {
            // Ответ с ошибкой с сервера (например, статусный код не 2xx)
            console.error('Request failed with status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            // Запрос был сделан, но нет ответа (например, отсутствует интернет)
            console.error('No response received:', error.request);
        } else {
            // Не удалось настроить запрос (например, ошибка в коде или сети)
            console.error('Request failed to set up:', error.message);
        }
    }
}