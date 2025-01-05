import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ISavedList } from '../interface/InputInterface';

const useFirebase = (collection: string = 'Record') => {
    const [message, setMessage] = useState('');

     useEffect(() => {
        if (message.length > 0) { console.log('Firebase Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (key: string, payload: ISavedList) => {
        try {
            if (payload.list.length > 0) {
                firestore().collection(collection).doc(key).set(payload);
            }
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const get = async (key: string) => {
        let json: ISavedList = { list: [] };
        try {
           const result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), '==', key).get();
            if (result?.docs.length > 0) { json = result?.docs?.[0].data() as ISavedList; }
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const getRange = async (keys: string[] = []) => {
        let json: {[key: string]: ISavedList} = {};
        try {
            let result;
            if (keys.length > 0) {
                result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), 'in', keys).get();
            } else {
                result = await firestore().collection(collection).get();
            }
            result?.docs.forEach(doc => {
                const { list } = doc.data();
                json[doc.id] = { list };
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const logAllJson = async () => {
        const result = await getRange();
        console.log(JSON.stringify(result));
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
