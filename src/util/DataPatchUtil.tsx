import { IStorage } from '../interface/DataInterface';
import { addNumber } from './NumberUtil';

export const getDaySumAndDaySumDetail = async (storage: IStorage) => {
    const result = await storage.getRange();
    Object.keys(result).forEach(key => {
        let daySum = 0;
        let daySumDetail: {[key: string]: number} = {};
        console.log(key, result[key])
        result[key].list.forEach(item => {
            const { group, value } = item;
            daySum = addNumber([daySum, value]);
            daySumDetail[group] = addNumber([daySumDetail[group] ?? 0, value]);
        });
        result[key].daySum = daySum;
        result[key].daySumDetail = daySumDetail;
        storage.set(key, result[key]);
    });
    return result;
};
