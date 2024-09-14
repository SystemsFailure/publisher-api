import { Request, Response, NextFunction } from "express";
import { Role } from "../database/models/Manager";

// Интерфейс для определения разрешенных маршрутов и методов
interface RoutePermission {
    method: string;
    path: string;
    roles: Role[];
}

// Определяем разрешенные маршруты и методы для ролей
const routePermissions = [
    { method: 'POST', path: '/create-user', roles: [Role.ADMIN, Role.CHIEF_MANAGER] },
    { method: 'POST', path: '/create-office', roles: [Role.ADMIN, Role.CHIEF_MANAGER] },
    // Добавьте другие маршруты и методы по необходимости
];

// Пример:
// Применяем middleware для проверки ролей и маршрутов
// app.use(authorizeRoutes(routePermissions));

// Middleware для проверки роли пользователя
export const authorizeRoutes = (permissions: RoutePermission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // const user = req.user; // Получаем информацию о текущем пользователе из req.user
        const user = null; // Получаем информацию о текущем пользователе из req.user

        if(user) {
            
        } else {

        }
        const managerId = req.params.managerId;
        const currentMethod = req.method; // Метод текущего запроса (GET, POST и т.д.)
        const currentPath = req.path; // Путь текущего запроса

        if (!user) {
            return res.status(401).send({ result: false, message: "Необходимо авторизоваться" });
        }

        // Находим разрешение для текущего метода и маршрута
        const permission = permissions.find(p => p.method === currentMethod && p.path === currentPath);

        if (!permission) {
            return res.status(404).send({ result: false, message: "Маршрут не найден" });
        }

        // Проверяем, имеет ли пользователь одну из разрешенных ролей
        // if (!permission.roles.includes(user.role)) {
        //     return res.status(403).send({ result: false, message: "У вас нет прав для доступа к этому ресурсу" });
        // }

        next(); // Если роль пользователя совпадает с одной из разрешенных, передаем управление следующему middleware или обработчику маршрута
    };
};
