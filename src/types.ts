export const leaseAppliancesOptions = {
    AirConditioning: 'Кондиционер',
    Refrigerator: 'Холодильник',
    Stove: 'Плита',
    Microwave: 'Микроволновка',
    WashingMachine: 'Стиральная машина',
    Dishwasher: 'Посудомоечная машина',
    WaterHeater: 'Водонагреватель',
    TV: 'Телевизор',
    Iron: 'Утюг',
    Hairdryer: 'Фен'
};

export const furnitureOptions: { [key: string]: string } = {
    Kitchen: 'Кухня',
    Cabinets: 'Шкафы',
    Beds: 'Спальные места',
};



export const leaseComfortOptions: { [key: string]: string } = {
    Fireplace: 'Камин',
    Parking: 'Парковка'
};

export const parkingAdditionallyOptions: { [key: string]: string } = {
    Free: 'Бесплатная',
    ForTrucks: 'Для грузовиков'
};

export const parkingOptions: { [key: string]: string } = {
    Underground: 'Подземная',
    GroundLevelMultilevel: 'Наземная многоуровневая',
    OpenYard: 'Открытая во дворе',
    BehindBarrierYard: 'За шлагбаумом'
};

export const leaseMultimediaOptions: { [key: string]: string } = {
    WiFi: 'Wi-Fi',
};

export const bathroomMultiOptions: { [key: string]: string } = {
    Combined: 'Совмещенный',
    Separate: 'Раздельный'
};

export interface ConvertInXMLOptions {
    outputPath?: string;
    fileName?: string;
    xmlOptions?: any;
}

export interface AuthorizationResponse {
    access_token: string;
}

export interface Credentials {
    client_id: string;
    client_secret: string;
}

export enum IAutoloadState {
    cancel = 'Отменена',
    pending = 'Ожидание',
    delay = 'Отложена',
    published = 'Опубликована'
}

export interface IAutoloadData {
    _id?: string,
    subId?: string,
    managerId?: string,
    feedName?: string,
    platform: string,
    storagePath: string,
    name: string,
    countAds?: number,
    status: IAutoloadState,
    createdAt: Date,
    publicatedAt?: Date,
}
export interface AdObject {
    ContactPhone?: string;
    ImageUrls?: Array<{ url: string }>;
    LeaseAppliances?: { [key in keyof typeof leaseAppliancesOptions]?: boolean };
    [key: string]: any;
}

export interface EmailType {
    accountId: string,
    typeUpload: string,
    mail: string,
    xml: string,
}

export interface AdData {
    "Площадка"?: string;
    Id: number;
    AdStatus: string;
    Category: string;
    OperationType: string;
    Address: string;
    DateBegin: string;
    DateEnd: string;
    Title: string;
    Description: string;
    HouseType: string;
    Rooms: string;
    Square: string;
    Floor: string;
    Floors: string;
    TypeHome: string;
    PropertyRights: string;
    LeaseType: string;
    LeaseCommissionSize: string;
    LeaseDeposit: string;
    Price: number;
    ContactMethod: string;
    ManagerName: string;
    ContactPhone: string;
    ImageNames: string;
    ImageUrls: string;
    ParkingType: string;
    RoomType: string;
    Renovation: string;
    KitchenSpace: number;
    UtilityMeters: string;
    OtherUtilities: string;
    OtherUtilitiesPayment: number;
    SmokingAllowed: string;
    ChildrenAllowed: string;
    PetsAllowed: string;
    LeaseComfort: string;
    LeaseMultimedia: string;
    LeaseBeds: string;
    LivingSpace: string;
    Documents: string;
    BuiltYear: number;
    Furniture: string;
    BathroomMulti: string;
    Parking: string;
    PassengerElevator: string;
    FreightElevator: string;
    Status: string;
    LeaseAppliances: string;
    BalconyOrLoggiaMulti: string;
    SafeDemonstration: string;
    // 'Вариант платного размещения': string;
}