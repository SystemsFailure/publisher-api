export const Boolean_ = (str: any) => {
    console.log(str, str === 'true', typeof str);

    if (typeof str === 'boolean') {
        return str;
    }
    if (str === 'true') {
        return true;
    }
    if (str === 'false') {
        return false;
    }
    return null; // Возвращаем null, если строка не является 'true' или 'false'
};