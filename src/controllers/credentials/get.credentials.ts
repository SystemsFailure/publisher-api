import { Request, Response } from 'express';
import { OfficeCredentialsService } from '../../database/services/OfficeCredentialsService';

export const getCredentialsController = async (req: Request, res: Response) => {
    const officeId = req.params.officeId;

    console.debug('[fetch cred, officeId]: ', officeId, typeof officeId);

    if (!officeId || officeId === undefined || officeId === 'undefined') {
        return res.send({ message: 'Офис ID является обязательным параметром', result: false });
    }
    
    console.log('[debug getting officeCredentials', officeId)
    const officeCredentialsService: OfficeCredentialsService = new OfficeCredentialsService();

    const officeCredential = await officeCredentialsService.getOfficeCredentialsWhere({ officeId: officeId });

    const outputOfficeCredential = officeCredential.map(it => Object.assign({}, { ...it.toObject() }));

    return res.json({ officeCredential: outputOfficeCredential, result: true });

}