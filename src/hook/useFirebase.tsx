import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ISavedData } from '../interface/InputInterface';

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

    const getRange = async (keys: string[] = []) => {
        try {
            let json: {[key: string]: any} = {};
            let result;
            if (keys.length > 0) {
                result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), 'in', keys).get();
            } else {
                result = await firestore().collection(collection).get();
            }
            result?.docs.forEach(doc => {
                let data = doc.data()?.list ?? [];
                data.map((item: any | ISavedData) => {
                    item.tag = item.tag.join(',');
                });
                json[doc.id] = data;
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const logAllJson = async () => {
        let json: {[key: string]: any} = {};
        const result = await getRange();

        result?.docs.forEach((doc: any) => {
            json[doc.id] = doc.data();
        });
        console.log(JSON.stringify(json));
	};

    return {
        set: set,
        get: get,
        getRange: getRange,
        logAllJson,
        message: message,
    };
};

export default useFirebase;
