import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ISavedList, IStorage } from '../interface/DataInterface';

const useFirebase = (collection: string = 'Record'): IStorage => {
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
        let json: ISavedList = { list: [], daySum: 0, daySumDetail: {} };
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
                json[doc.id] = doc.data() as ISavedList;
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const logAllRecord = async () => {
        const result = await getRange();
        console.log(JSON.stringify(result));
	};

    return {
        set: set,
        get: get,
        getRange: getRange,
        logAllRecord: logAllRecord,
        message: message,
    };
};

export default useFirebase;
