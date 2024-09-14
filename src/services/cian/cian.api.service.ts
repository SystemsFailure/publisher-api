import nodemailer from 'nodemailer';
import { mailtrapConfig } from '../../../config';
import { SubjectMail } from './types';

class CianApiService {
    private static instance: CianApiService;

    private constructor() { }

    public static getInstance(): CianApiService {
        if (!CianApiService.instance) {
            CianApiService.instance = new CianApiService();
        }
        return CianApiService.instance;
    }

    // метод для отправки письма
    public mail(message: string): any {
        const { transporter, mailOptions } = this
            .configTransport(
                {
                    to: 'hydrogen1618030@gmail.com',
                    from: 'allistirking422@gmail.com',
                    subject: 'Выгрузка из xml фида'
                }
            );

        transporter.sendMail(Object.assign({}, mailOptions, {
            text: message
        }), function (error, info) {
            if (error) {
                throw new Error(error.message);
            } else {
                return info;
            }
        });
    }

    private configTransport(
        { to, from, subject }: SubjectMail
    ) {
        // Настройка транспорта (SMTP-сервера)
        const transporter = nodemailer.createTransport(mailtrapConfig);

        // Настройка письма
        const mailOptions = { from, to, subject, };

        return {
            transporter,
            mailOptions,
        }
    }
}

export default CianApiService;