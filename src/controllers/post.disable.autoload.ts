// import { Request, Response } from "express";
// import AvitoAPI from "../avito.api.service";
import { AuthService } from "../patterns/strategy/Avito/AvitoStrategy"
// import { avitoApiConfig } from "../../config";

// /**
//  * Обработчик установки времени для автовыгрузки профиля
//  * @param req Запрос Express
//  * @param res Ответ Express
//  */
// export const setupAutoloadTimeController = async (req: Request, res: Response) => {
//     const { enabled } = req.body;

//     try {
//         const authService: AuthService = new AuthService(avitoApiConfig.client_id!, avitoApiConfig.client_secret!);
//         const token = await authService.token();

//         const avitoApi: AvitoAPI = new AvitoAPI(token);

//         const config = {
//             agreement: true,
//             autoload_enabled: enabled,
//             report_email: "allistirking422@gmail.com",
//             schedule: [],
//             upload_url: String(''),
//         };

//         const responseData = await avitoApi.createOrUpdateProfile(config);

//         return res.send({
//             result: true,
//             message: "Автовыгрузка успешно отключена\включена",
//         });
//     } catch (error) {
//         console.error("Произошла ошибка при попытке отключить\включить автовыгрузку:", error);

//         return res.status(500).send({
//             result: false,
//             message: "Произошла ошибка при попытке отключить\включить автовыгрузку",
//             error: error || "Внутренняя ошибка сервера",
//         });
//     }
// };
