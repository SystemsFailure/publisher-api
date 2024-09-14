import { OfficeCredentialsService } from "../../../../database/services/OfficeCredentialsService";

export const checkCredentials = async (officeId: string, platform: string) => {
    const officeCredentialsService = new OfficeCredentialsService();
    const credentials = await officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform });

    if (credentials.length === 0) {
        throw new Error('Не найдены учетные данные офиса для юлы');
    }

    return JSON.parse(credentials[0].toObject().credentials);
}