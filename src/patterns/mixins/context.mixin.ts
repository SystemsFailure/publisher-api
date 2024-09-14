import { randomBytes } from "crypto";
import { GenericObject } from "../../services/publisher.class";

type Constructor<T = {}> = new (...args: any[]) => T;

export type ItemWithId = GenericObject & {
    Id: string;
};

// Функция проверки на дубликаты в массиве объектов с Id
function hasDuplicates(array: ItemWithId[]): boolean {
    const idSet = new Set<string>();

    for (const item of array) {
        if (idSet.has(item.Id)) {
            return true;
        }
        idSet.add(item.Id);
    }

    return false;
}

// Перечень допустимых значений для полей
const allowedPlatforms = ["Авито", "Циан", "Юла"];
const validCategories = ["Квартиры"];
const validRoomTypes = ["Изолированные", "Смежные"];
const validRenovationValues = ["Требуется", "Косметический", "Евро", "Дизайнерский"];
const validPropertyRightsValues = ["Собственник", "Посредник"];
const validLeaseTypeValues = ["На длительный срок", "Посуточно"];
const validHouseTypeValues = ["Кирпичный", "Панельный", "Блочный", "Монолитный", "Монолитно-кирпичный", "Деревянный"];
const validRoomsValues = ["Студия", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10 и более", "Своб. планировка"];
const validLeaseDepositValues = ["Без залога", "0,5 месяца", "1 месяц", "1,5 месяца", "2 месяца", "2,5 месяца", "3 месяца"];
const validUtilityMetersValues = ["Оплачивается арендатором", "Оплачивается собственником"];
const validOtherUtilitiesValues = ["Оплачивается арендатором", "Оплачивается собственником"];
const validYesNoValues = ["Да", "Нет"];
const validOperationType = ["Сдам"];

// Функция для валидации поля
const validateField = (field: string, value: any, validValues: string[], index: number): string | null => {
    if (value && !validValues.includes(value)) {
        return `Неверное значение для ${field} на индексе ${index}: должно быть одним из ${validValues.join(', ')}.`;
    }
    return null;
};

// Миксин для валидации схемы данных
export function MixinValidateSchema<M extends Constructor>(Base: M) {
    return class extends Base {
        public validateSchema(data: GenericObject[]): (string[] | null)[] {
            return data.map((item, index) => {
                const errors: string[] = [];
                console.debug('[DEBUG VALIDATION FIELDS]: \n', item, item.Id, item.Description);

                // Проверка на наличие обязательных полей
                const requiredFields = [
                    'Площадка', 'Id', 'Category', 'ImageUrls', 'Description', 'Address',
                    'OperationType', 'ContactPhone', 'Price', 'RoomArea', 'RoomType',
                    'Renovation', 'PropertyRights', 'LeaseType', 'HouseType', 'Floor',
                    'Floors', 'Rooms', 'Square', 'LeaseDeposit', 'LeaseCommissionSize',
                    'KitchenSpace', 'UtilityMeters', 'OtherUtilities', 'OtherUtilitiesPayment',
                    'SmokingAllowed', 'ChildrenAllowed', 'PetsAllowed'
                ];

                // Проверка на дубликаты Id
                const itemsWithId: ItemWithId[] = data.filter((item): item is ItemWithId => 'Id' in item);
                if (hasDuplicates(itemsWithId)) {
                    errors.push(`Найден дубликат в значениях Id в объявлениях`);
                }

                // Проверка обязательных полей
                requiredFields.forEach(field => {
                    if (item[field] === undefined || item[field] === null || !(field in item)) {
                        errors.push(`Отсутствует обязательное поле ${field} на индексе ${index}.`);
                    }
                });

                // Валидация полей по типу данных
                if (typeof item.Id !== 'string' || !item.Id) {
                    errors.push(`Не валидный айди на индексе ${index}: должен быть строкой и не пустым.`);
                }
                if (typeof item.Description !== 'string') {
                    errors.push(`Неверное Описание на индексе ${index}: должно быть строкой.`);
                }
                if (isNaN(Number(item.Price))) {
                    errors.push(`Неверная Цена на индексе ${index}: должна быть числом.`);
                }

                // Валидация полей на совпадения и включение в допустимые значения
                const validations = [
                    { field: 'Площадка', value: item['Площадка'], validValues: allowedPlatforms },
                    { field: 'Category', value: item.Category, validValues: validCategories },
                    { field: 'OperationType', value: item.OperationType, validValues: validOperationType },
                    { field: 'RoomType', value: item.RoomType, validValues: validRoomTypes },
                    { field: 'Renovation', value: item.Renovation, validValues: validRenovationValues },
                    { field: 'PropertyRights', value: item.PropertyRights, validValues: validPropertyRightsValues },
                    { field: 'LeaseType', value: item.LeaseType, validValues: validLeaseTypeValues },
                    { field: 'HouseType', value: item.HouseType, validValues: validHouseTypeValues },
                    { field: 'Rooms', value: item.Rooms, validValues: validRoomsValues },
                    { field: 'LeaseDeposit', value: item.LeaseDeposit, validValues: validLeaseDepositValues },
                    { field: 'UtilityMeters', value: item.UtilityMeters, validValues: validUtilityMetersValues },
                    { field: 'OtherUtilities', value: item.OtherUtilities, validValues: validOtherUtilitiesValues },
                    { field: 'SmokingAllowed', value: item.SmokingAllowed, validValues: validYesNoValues },
                    { field: 'ChildrenAllowed', value: item.ChildrenAllowed, validValues: validYesNoValues },
                    { field: 'PetsAllowed', value: item.PetsAllowed, validValues: validYesNoValues },
                ];

                validations.forEach(({ field, value, validValues }) => {
                    const error = validateField(field, value, validValues, index);
                    if (error) errors.push(error);
                });

                // Специфические проверки в зависимости от платформы
                if (item['Площадка'] === 'Авито') {
                    this.validateAvito(item, errors, index);
                } else if (item['Площадка'] === 'Циан') {
                    this.validateCian(item, errors, index);
                }

                return errors.length > 0 ? errors : null;
            }).filter(errors => errors !== null);
        }

        // Специфическая валидация для Авито
        private validateAvito(item: GenericObject, errors: string[], index: number) {
            if (typeof item.Address !== 'string') {
                errors.push(`Неверный адрес на индексе ${index}: должно быть строкой.`);
            }
        }

        // Специфическая валидация для Циан
        private validateCian(item: GenericObject, errors: string[], index: number) {
            if (isNaN(Number(item.Rooms))) {
                errors.push(`Неверное количество комнат на индексе ${index}: должно быть числом.`);
            }
        }
    };
}

// Миксин для генерации уникальных значений ID
function MixinGenUniqueHash<M extends Constructor>(Base: M) {
    return class extends Base {
        public generateRandomId(): string {
            return randomBytes(16).toString('hex');
        }
    };
}

// Класс, объединяющий оба миксина
class CombinedClass extends MixinValidateSchema(MixinGenUniqueHash(Object)) { }
