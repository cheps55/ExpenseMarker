import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

const useLocalStorage = () => {

    const [message, setMessage] = useState('');

    const set = async (key: string, payload: any) => {
        try {
			await AsyncStorage.setItem(key, JSON.stringify(payload));
			setMessage('Save Complete');
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
            setMessage('Clear All Complete');
		} catch (e: any) {
			setMessage(e.message);
		}
    }

    return {
        set: set,
        get: get,
        clear: clear,
        message: message,
    };
};

export default useLocalStorage;

