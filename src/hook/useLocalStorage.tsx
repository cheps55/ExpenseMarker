import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

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
        clear: clear,
        message: message,
    };
};

export default useLocalStorage;

