import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { CloudCollection } from '../enum/CollectionEnum';
import { IHistoryData, ISumByDayData, ISumByNameData } from '../interface/DataInterface';

const useFirebase = () => {
    const [message, setMessage] = useState('');

     useEffect(() => {
        if (message.length > 0) { console.log('Firebase Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (collection: string, key: string, payload: IHistoryData | ISumByNameData | ISumByDayData) => {
        try {
            firestore().collection(collection).doc(key).set(payload);
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const get = async (collection: string, key: string) => {
        let json: IHistoryData | ISumByNameData | ISumByDayData = { list: [], sum: 0 };
        try {
           const result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), '==', key).get();
            if (result?.docs.length > 0) { json = result?.docs?.[0].data() as any; }
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const getRange = async (collection: string, keys: string[] = []) => {
        let json: {[key: string]: IHistoryData | ISumByNameData | ISumByDayData} = {};
        try {
            let result;
            if (keys.length > 0) {
                result = await firestore().collection(collection).where(firestore.FieldPath.documentId(), 'in', keys).get();
            } else {
                result = await firestore().collection(collection).get();
            }
            result?.docs.forEach(doc => {
                json[doc.id] = doc.data() as any;
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const remove = async (collection: string, key: string) => {
        try {
            await firestore().collection(collection).doc(key).delete();
        } catch (e: any) {
            setMessage(e.message);
        }
	};

    const logAllRecord = async () => {
        for (const collection of Object.values(CloudCollection)) {
            const result = await getRange(collection);
            console.log(JSON.stringify(result));
        }
	};

    return {
        set: set,
        get: get,
        getRange: getRange,
        remove: remove,
        logAllRecord: logAllRecord,
        message: message,
    };
};

export default useFirebase;
