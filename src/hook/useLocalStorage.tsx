import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { useEffect, useState } from 'react';
import { ISavedData } from '../interface/InputInterface';

const useLocalStorage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message.length > 0) { console.log('Local Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (key: string, payload: any) => {
        try {
            if (payload.length > 0) {
                await AsyncStorage.setItem(key, JSON.stringify(payload));
            }
		} catch (e: any) {
			setMessage(e.message);
		}
    };

    const get = async (key: string) => {
        try {
			const result = await AsyncStorage.getItem(key);
            return result ? JSON.parse(result) : {};
		} catch (e: any) {
			setMessage(e.message);
		}
    };

    const getRange = async (keys: string[] = []) => {
        try {
            const _keys = keys.length > 0 ? keys : await AsyncStorage.getAllKeys();
            const result: readonly KeyValuePair[] = await AsyncStorage.multiGet(_keys);
            let obj: {[key: string]: ISavedData[]} = {};
            result.forEach((value: KeyValuePair) => {
                obj[value[0]] = value[1] ? JSON.parse(value[1]) : [];
            });
            return obj;
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
        clear: clear,
        message: message,
    };
};

export default useLocalStorage;

