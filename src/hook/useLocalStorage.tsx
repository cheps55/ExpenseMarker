import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { SaveObject } from '../interface/SaveObject';

const useLocalStorage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message.length > 0) { console.log('Local Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (key: string, payload: any) => {
        try {
			await AsyncStorage.setItem(key, JSON.stringify(payload));
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

    const getAll = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const result: any = await AsyncStorage.multiGet(keys);
            let obj: {[key: string]: SaveObject} = {};
            result.forEach((item: string[]) => {
                obj[item[0]] = JSON.parse(item[1]);
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
        getAll: getAll,
        clear: clear,
        message: message,
    };
};

export default useLocalStorage;

