import { AdObject } from "../../types";

export interface MappingOptions {
    typeMapping: Record<string, string>;
    categoryMapping: Record<string, string>;
    typeRenovationMapping: Record<string, string>;
}

// Класс-утилита для конвертации объектов в формат Yandex
export default class ObjectConverter {
    // Основной метод конвертации объектов
    static async convertKeysToJson(objects: AdObject[], options: MappingOptions): Promise<any> {
        const { typeMapping, categoryMapping, typeRenovationMapping } = options;

        // Преобразование каждого объекта в асинхронном режиме
        const offers = await Promise.all(objects.map(async (obj) => {

            // Получение координат для адреса
            const coords = await this.getCoordinates(String(obj.Address));

            // Разделение номера телефона на части
            const splitedContactPhone = obj.ContactPhone ? obj.ContactPhone.split('|') : [];

            // Формирование результата с фильтрацией пустых свойств
            const result: any = this.filterEmptyProperties({
                _attributes: { 'internal-id': obj.Id },
                type: { _text: 'аренда' },
                'property-type': { _text: 'жилая' },
                'creation-date': { _text: new Date().toISOString() },
                location: {
                    address: { _text: obj.Address },
                    latitude: { _text: coords ? coords.latitude.toString() : '' },
                    longitude: { _text: coords ? coords.longitude.toString() : '' }
                },
                'sales-agent': {
                    phone: splitedContactPhone.length >= 2 ? { _text: `+${splitedContactPhone[0].trim()} ${splitedContactPhone[1].trim()}` } : null,
                    category: { _text: 'agency' },
                    name: { _text: obj.SalesAgentName || 'КБК' },
                    organization: { _text: obj.SalesAgentOrganization || 'КБК' },
                },
                image: obj.ImageUrls ? obj.ImageUrls.map(img => ({ _text: img.url })) : [],
                price: {
                    value: { _text: obj.Price },
                    currency: { _text: 'RUR' },
                    period: { _text: 'месяц' }
                },
                'rent-pledge': { _text: obj.LeaseDeposit ? 'да' : 'нет' },
                area: {
                    value: { _text: obj.Square },
                    unit: { _text: 'кв. м' }
                },
                'room-space': {
                    value: { _text: obj.RoomArea },
                    unit: { _text: 'кв. м' }
                },
                'kitchen-space': {
                    value: { _text: obj.KitchenSpace },
                    unit: { _text: 'кв. м' }
                },
                'living-space': {
                    value: { _text: obj.Square },
                    unit: { _text: 'кв. м' }
                },
                floor: { _text: obj.Floor },
                'rooms-type': { _text: obj.RoomType },
                'floors-total': { _text: obj.Floors },
                description: { _text: obj.Description },
                prepayment: { _text: Number(obj.Prepayment || 100) },
                category: { _text: this.mapCategoryValue(categoryMapping, obj.Category) },
                'built-year': { _text: Number(obj.BuiltYear) },
                ...this.mapRoomsValue(obj.Rooms),
                ...(obj.Renovation && { renovation: { _text: typeRenovationMapping[obj.Renovation] } }),
                ...(obj.BathroomMulti?.Combined && { 'bathroom-unit': { _text: "совмещенный" } }),
                ...(obj.BathroomMulti?.Separate && { 'bathroom-unit': { _text: "раздельный" } }),
                ...(obj.LeaseAppliances?.Refrigerator && { refrigerator: { _text: 1 } }),
                ...(obj.LeaseAppliances?.WashingMachine && { 'washing-machine': { _text: 1 } }),
                ...(obj.LeaseAppliances?.Dishwasher && { dishwasher: { _text: 1 } }),
                ...(obj.LeaseAppliances?.AirConditioning && { 'air-conditioner': { _text: 1 } }),
                ...(obj.LeaseMultimedia?.Wifi && { internet: { _text: 1 } }),
                ...(obj.LeaseAppliances?.TV && { television: { _text: 1 } }),
                ...(obj.LeaseComfort?.BalconyLoggia && { balcony: { _text: 1 } }),
                ...(!Number(obj?.LeaseCommissionSize) && { 'agent-fee': { _text: Number(obj.LeaseCommissionSize) } }),
                ...(obj.ChildrenAllowed === "Да" && { 'with-children': { _text: 1 } }),
                ...(obj.PetsAllowed === 'Да' && { 'with-pets': { _text: 1 } }),
                ...(obj.HouseType && typeMapping[obj.HouseType] && { 'building-type': { _text: typeMapping[obj.HouseType] } }),
            });

            return result;

        }));

        // Формирование итогового объекта фида
        const feed = {
            _declaration: { _attributes: { version: "1.0", encoding: "UTF-8" } },
            'realty-feed': {
                _attributes: { xmlns: "http://webmaster.yandex.ru/schemas/feed/realty/2010-06" },
                'generation-date': { _text: new Date().toISOString() },
                offer: offers.map(this.filterEmptyProperties)
            }
        };

        return feed;
    }

    // Метод для фильтрации значений null, undefined и пустых строк
    static filterEmptyProperties(obj: any): any {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );
    }

    // Метод для маппинга категорий объявлений
    static mapCategoryValue(categoryMapping: Record<string, string>, category: string): string {
        return categoryMapping[category] || "";
    }

    // Метод для маппинга количества комнат
    static mapRoomsValue(rooms: string): { rooms: number, studio?: string } {
        const roomsCount = parseInt(rooms);
        if (!isNaN(roomsCount) && roomsCount >= 1 && roomsCount <= 9) {
            return { rooms: roomsCount };
        }
        if (rooms === "Студия") {
            return { rooms: 0, studio: "Студия" };
        }
        return { rooms: 0 };
    }

    // Метод для получения координат по адресу с помощью Яндекс Карт
    static async getCoordinates(address: string): Promise<{ latitude: number, longitude: number } | null> {
        try {
            const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=9c785e76-6599-45af-b388-a45cb0e2b00b&format=json&geocode=${encodeURIComponent(address)}, Россия`);
            const data = await response.json();
            const coordinates = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
            const latitude = parseFloat(coordinates[1]);
            const longitude = parseFloat(coordinates[0]);
            return { latitude, longitude };
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }
}
