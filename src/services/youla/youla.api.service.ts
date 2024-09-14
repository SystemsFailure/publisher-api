import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { parse } from 'cookie';
import { FeedButtonsCreatePublicationData, FeedCardData, FeedCreateInput } from './types';

// Класс-сервис для работы с автовыгрузкой Юлы
export default class YoulaService {
    private accessToken: string;
    private headers: any;
    private reqUrl: string;

    constructor(token: string = '') {
        this.accessToken = token;
        this.headers = {
            "authorization": `Bearer ${token}`,
            "content-type": "application/json",
        };
        this.reqUrl = 'https://youla.ru/pro/graphql';
    }

    // Метод запроса на установку данных фида(url, title, categoryId e.t.c)
    public async setupAutoload(data: FeedCreateInput, accessToken?: string) {

        const headers = {
            "authorization": `Bearer ${accessToken}`,
            "content-type": "application/json",
        };

        const dataFeed: FeedCreateInput = {
            operationName: "FeedCreate",
            variables: {
                feedInput: {
                    ...data.variables.feedInput,
                    schemeId: "5bf5153217d97b000151467b",
                    userContactID: "668bbccf6139c4edb3058c98",
                    categoryId: "20"
                }
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: "9b8fb7440ab36f210500b886743a995d2b61307151338e795cc29b5d7639aab4"
                }
            }
        };

        const response = await axios.post(this.reqUrl, dataFeed, { headers })
        return response;
    }

    // Метод запроса на обновление jwt-токена
    public async refreshToken(): Promise<void> {
        const url = 'https://youla.ru/web-api/auth/refresh_token';

        const headers = {
            accept: '*/*',
            'content-type': 'application/json; charset=utf-8',
        };

        const config: AxiosRequestConfig = {
            headers: headers,
            method: 'POST',
            url: url,
        };

        try {
            const response = await axios(config);

            console.log('Response data:', response.data);
            console.log('Response status:', response.status);

            const token = response.data.jwt;
            if (token) {
                this.accessToken = token;
                return token;
            }
        } catch (error) {
            console.error('Error refreshing token: ', error);
        }
    }

    // Метод запроса на запуск автовыгрузки 
    public async startAutoload(data: FeedButtonsCreatePublicationData, accessToken?: string) {

        const headers = {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        };

        const dataFeed: FeedButtonsCreatePublicationData = {
            operationName: 'FeedButtonsCreatePublication',
            variables: {
                ...data.variables,
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: 'f068c253549dc5bf87d1638a76807f2b4f2fb21150132a4730fb9ef92113c5e1'
                }
            }
        };

        try {
            const response = await axios.post(this.reqUrl, dataFeed, { headers });
            console.log('Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Метод запроса на получения информации по выгрузкам
    public async fetchData(data: FeedCardData, accessToken: string) {

        const headers = {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        };


        const dataFeed: FeedCardData = {
            operationName: 'FeedCard',
            variables: {
                ...data.variables,
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '0534fae3a48f2b2a183eb1afd6193347f248ff8f183b36b7e9314ee7ab69df5c',
                },
            },
        };

        try {
            const response = await axios.post(this.reqUrl, dataFeed, { headers });
            console.log('Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    public async deleteAutoload(autoloadId: string) {
        interface GraphqlRequest {
            operationName: string;
            variables: {
                feedId: string;
            };
            extensions: {
                persistedQuery: {
                    version: number;
                    sha256Hash: string;
                };
            };
        }

        const headers = {
            authorization: 'Bearer ' + this.accessToken,
            'content-type': 'application/json',
        };

        const requestBody: GraphqlRequest = {
            operationName: 'FeedButtonsDeleteFeed',
            variables: {
                feedId: autoloadId, // пример: '668cf97b651f27be6a1500e3'
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: 'ac341fae341fc2fa7082dfb193e82c8683c10013078df41c9089ba254fbcfedf',
                },
            },
        };

        try {
            const response: AxiosResponse = await axios.post(this.reqUrl, requestBody, { headers });
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    public async fetchAutoloads() {
        const requestBody = {
            operationName: 'Autoload',
            variables: {
                offset: 0,
                limit: 20
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '129c84a01874414e333736146654bd477989e2f1f3d3ccdca7f4b6ab0018478d'
                }
            }
        };

        const headers = {
            'authorization': `Bearer ${this.accessToken}`,
            'content-type': 'application/json',
        };

        // {"data":{"feeds":{"count":0,"feeds":[],"__typename":"ImportFeeds"}}} - Формат ответа
        fetch(this.reqUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Response:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Вспомогательный метод для извлечения accessToken-на из cookie
    public extractYoulaAuth(cookieString?: string): string | null {
        // Пока что просто для примера
        if (!cookieString) {
            cookieString = 'sessid=1ta71krkfg7086j6qtjgg9gt5i; _youla_uid=664c647a9bcaa; tmr_lvid=196ce937d3cbe40467c1f4997fe3c029; tmr_lvidTS=1716282493959; _ym_uid=1716282496538280048; _ym_d=1716282496; youla_verificationmodal=disabled; _ga_PGNMEF36MP=GS1.2.1718862963.2.0.1718862963.60.0.0; _ga_VF0WLJ6YME=GS1.1.1718974189.19.0.1718974189.0.0.0;';
        }
        const cookies = parse(cookieString);
        return cookies.youla_auth || null;
    }
}
