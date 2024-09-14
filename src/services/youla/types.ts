export interface FeedCreateInput {
    operationName?: string;
    variables: {
        feedInput: {
            userContactID: string;
            categoryId: string;
            schemeId: string;
            url: string;
            title: string;
        };
    };
    extensions?: {
        persistedQuery: {
            version: number;
            sha256Hash: string;
        };
    };
}

export interface FeedButtonsCreatePublicationData {
    operationName?: string;
    variables: {
        feedId: string;
    };
    extensions?: {
        persistedQuery: {
            version: number;
            sha256Hash: string;
        };
    };
}

export interface FeedCardData {
    operationName?: string;
    variables: {
        id: string;
    };
    extensions?: {
        persistedQuery: {
            version: number;
            sha256Hash: string;
        };
    };
}

export interface Feed {
    address: {
        description: string;
        lng: string;
        ltd: string;
    };
    category_id: number;
    feed_uri: string;
    id: string;
    scheme: {
        id: string;
        title: string;
    };
    title: string;
    to_delete: boolean;
    user_contact: {
        id: string;
        phone: string;
        product_count: number;
        username: string;
    };
}

export interface FeedResponse {
    count: number;
    data: Feed[];
}

export interface CreateFeedRequest {
    address?: {
        description: string;
        lng: string;
        ltd: string;
    };
    category_id?: string;
    id?: string;
    scheme_id: string;
    title: string;
    url: string;
    user_contact_id: string;
}

export interface CreateFeedResponse {
    data: {
        address: {
            description: string;
            lng: string;
            ltd: string;
        };
        category_id: number;
        feed_uri: string;
        id: string;
        scheme: {
            id: string;
            title: string;
        };
        title: string;
        to_delete: boolean;
        user_contact: {
            id: string;
            phone: string;
            product_count: number;
            username: string;
        };
    };
}

export interface LaunchData {
    created_at: string;
    guid: string;
    id: string;
    stats: {
        all: number;
        archived: number;
        created: number;
        failed: number;
        notChanged: number;
        published: number;
        updated: number;
    };
    status: string;
    updated_at: string;
}