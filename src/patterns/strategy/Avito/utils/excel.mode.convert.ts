import _ from "lodash";
import { toYesNot } from "./yes.not.convert";
import { Boolean_ } from "./boolean.convert";
import { bathroomMultiOptions, furnitureOptions, leaseAppliancesOptions, leaseComfortOptions, leaseMultimediaOptions, parkingAdditionallyOptions, parkingOptions } from "./maps";

export function excelModeConverter(obj: any, result_: any): any {
    const result = _.cloneDeep(result_);

    const {
        AirConditioning, Refrigerator, Stove, Microwave, WashingMachine, Dishwasher,
        WaterHeater, TV, Iron, Hairdryer, Kitchen, Cabinets, Beds, Wifi, Fireplace,
        BalconyLoggia, Parking, Free, ForTrucks, Combined, Separate, Underground,
        GroundLevelMultilevel, OpenYard, BehindBarrierYard, ImageUrls,
    } = obj;

    // Обработка файлов объектов из excel таблицы
    if (ImageUrls) {
        // Разделяем строку по запятым и убираем пробелы по краям каждого URL
        console.log(typeof ImageUrls, ImageUrls)
        const urls = String(ImageUrls).split(',').map(url => url.trim());

        // Преобразуем каждый URL в объект с нужной структурой
        result.Images = {
            Image: urls.map(url => ({ _attributes: { url } }))
        };
    }

    const createOptions = (options: any, source: any) => {
        return options
            .filter(Boolean) // Фильтруем только те, которые вернули true
            .map((option: any) => ({
                _text: source[option],
            }));
    };

    console.log(
        '{adwadwadw}: \n',
        typeof AirConditioning,
        typeof toYesNot(AirConditioning)
    )

    result.LeaseAppliances = {
        Option: createOptions(
            [
                Boolean_(AirConditioning) && 'AirConditioning',
                Boolean_(Refrigerator) && 'Refrigerator',
                Boolean_(Stove) && 'Stove',
                Boolean_(Microwave) && 'Microwave',
                Boolean_(WashingMachine) && 'WashingMachine',
                Boolean_(Dishwasher) && 'Dishwasher',
                Boolean_(WaterHeater) && 'WaterHeater',
                Boolean_(TV) && 'TV',
                Boolean_(Iron) && 'Iron',
                Boolean_(Hairdryer) && 'Hairdryer',
            ],
            leaseAppliancesOptions
        ),
    };

    result.Furniture = {
        Option: createOptions([
            Boolean_(Kitchen) && 'Kitchen',
            Boolean_(Cabinets) && 'Cabinets',
            Boolean_(Beds) && 'Beds',
        ], furnitureOptions),
    };

    result.LeaseMultimedia = {
        Option: createOptions([
            Boolean_(Wifi) && 'Wifi',
        ], leaseMultimediaOptions),
    };

    result.LeaseComfort = {
        Option: createOptions([
            Boolean_(Fireplace) && 'Fireplace',
            Boolean_(BalconyLoggia) && 'BalconyLoggia',
            Boolean_(Parking) && 'Parking',
        ], leaseComfortOptions),
    };

    result.ParkingAdditionally = {
        Option: createOptions([
            Boolean_(Free) && 'Free',
            Boolean_(ForTrucks) && 'ForTrucks',
        ], parkingAdditionallyOptions),
    };

    result.BathroomMulti = {
        Option: createOptions([
            Boolean_(Combined) && 'Combined',
            Boolean_(Separate) && 'Separate',
        ], bathroomMultiOptions),
    };

    result.Parking = {
        Option: createOptions([
            Boolean_(Underground) && 'Underground',
            Boolean_(GroundLevelMultilevel) && 'GroundLevelMultilevel',
            Boolean_(OpenYard) && 'OpenYard', Boolean_(BehindBarrierYard) && 'BehindBarrierYard',
        ], parkingOptions),
    };

    const propertiesToRemove = [
        'AirConditioning', 'Refrigerator', 'Stove', 'Microwave', 'WashingMachine',
        'Dishwasher', 'WaterHeater', 'TV', 'Iron', 'Hairdryer', 'Kitchen',
        'Cabinets', 'Beds', 'Wifi', 'Fireplace', 'BalconyLoggia', 'Parking',
        'Free', 'ForTrucks', 'Combined', 'Separate', 'Underground',
        'GroundLevelMultilevel', 'OpenYard', 'BehindBarrierYard'
    ];

    propertiesToRemove.forEach(prop => {
        delete result[prop];
    });

    const headerPropertiesToRemove = [
        'LeaseAppliances',
        'Furniture',
        'LeaseMultimedia',
        'LeaseComfort',
        'ParkingAdditionally',
        'BathroomMulti',
        'Parking',
    ];

    headerPropertiesToRemove.forEach(prop => {
        console.log(typeof result[prop], result[prop])
        if (Array.isArray(result[prop]?.Option) && result[prop].Option.length === 0) {
            console.log('delete prop from result');
            delete result[prop];
        }
    });

    return result;
}