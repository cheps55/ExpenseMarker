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

    const getAll = async () => {
        try {
            let json: {[key: string]: any} = {};
            const result = await firestore().collection(collection).get();
            result?.docs.forEach(doc => {
                json[doc.id] = doc.data().list;
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const logAllJson = async () => {
        let json: {[key: string]: any} = {};
        const result = await getAll();

        result?.docs.forEach((doc: any) => {
            json[doc.id] = doc.data();
        });
        console.log(JSON.stringify(json));
	};

    return {
        set: set,
        get: get,
        getAll: getAll,
        logAllJson,
        message: message,
    };
};

export default useFirebase;
