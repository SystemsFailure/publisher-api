export type GenericObject = { [key: string]: any };

// Функция для замены ключей в объекте
export const transformKeys = (obj: GenericObject): GenericObject => {
    const transformedObj: GenericObject = {};
  
    for (const [key, value] of Object.entries(obj)) {
      // Разделяем ключ по "||" и берем часть после знака
      const newKey = key.split('||')[1]?.trim() || key;
      transformedObj[newKey] = typeof value === 'string' ? value.trim() : value;
    }
  
    return transformedObj;
};
  
  // Функция для обработки массива объектов
export const transformArray = (arr: GenericObject[]): GenericObject[] => {
    return arr.map(transformKeys);
};