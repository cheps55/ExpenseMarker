import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { useEffect, useState } from 'react';
import { IHistoryData, ISumByDayData, ISumByNameData } from '../interface/DataInterface';

const useLocalStorage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message.length > 0) { console.log('Local Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (key: string, payload: IHistoryData | ISumByNameData | ISumByDayData) => {
        try {
            if (Object.keys(payload).length > 0) {
                await AsyncStorage.setItem(key, JSON.stringify(payload));
            }
		} catch (e: any) {
			setMessage(e.message);
		}
    };

    const get = async (key: string) => {
        let json: IHistoryData | ISumByNameData | ISumByDayData = { list: [], sum: 0 };
        try {
			const result = await AsyncStorage.getItem(key);
            if (result) { json = JSON.parse(result); }
            return json;
		} catch (e: any) {
			setMessage(e.message);
            return json;
		}
    };

    const getRange = async (keys: string[] = []) => {
        let json: {[key: string]: IHistoryData | ISumByNameData | ISumByDayData} = {};
        try {
            const _keys = keys.length > 0 ? keys : await AsyncStorage.getAllKeys();
            const result: readonly KeyValuePair[] = await AsyncStorage.multiGet(_keys);
            result.forEach((value: KeyValuePair) => {
                json[value[0]] = value[1] ? JSON.parse(value[1]) : {};
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const remove = async (key: string) => {
        try {
			await AsyncStorage.removeItem(key);
		} catch (e: any) {
			setMessage(e.message);
		}
    };

    const clear = async () => {
        try {
			await AsyncStorage.clear();
		} catch (e: any) {
			setMessage(e.message);
		}
    };

    return {
        set: set,
        get: get,
        getRange: getRange,
        remove: remove,
        clear: clear,
        message: message,
    };
};

export default useLocalStorage;

