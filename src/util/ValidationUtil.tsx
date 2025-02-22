import { LocalStorageKey } from '../enum/CollectionEnum';

export const isHistoryData = (key: string) => /^[0-9]+$/g.test(key) && typeof Number(key) === 'number';

export const isSumByDayData = (key: string) => /[0-9]{4}-[0-9]{2}-[0-9]{2}/g.test(key);

export const isSumByNameData = (key: string) => !isHistoryData(key) && !isSumByDayData(key);

export const isDeletedList = (key: string) => key === LocalStorageKey.deleteRecord;
