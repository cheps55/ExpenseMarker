import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

const useFirebase = (collection: string = 'Record') => {
    const [message, setMessage] = useState('');

     useEffect(() => {
        if (message.length > 0) { console.log('Firebase Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (key: string, payload: any) => {
        try {
            firestore().collection(collection).doc(key).set({ list: payload });
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const get = async (key: string) => {
        try {
            const result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), '==', key).get();
            return result;
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    return {
        set: set,
        get: get,
        message: message,
    };
};

export default useFirebase;
