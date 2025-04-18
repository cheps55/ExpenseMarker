import { collection, deleteDoc, doc, getDocs, getFirestore, query, setDoc, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { CloudCollection } from '../enum/CollectionEnum';
import { IHistoryData, ISumByDayData, ISumByNameData } from '../interface/DataInterface';

const db = getFirestore();
const DocumentId = '__name__';

const useFirebase = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message.length > 0) { console.log('Firebase Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (collectionName: string, key: string, payload: IHistoryData | ISumByNameData | ISumByDayData) => {
        try {
            await setDoc(doc(collection(db, collectionName), key), payload);
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const get = async (collectionName: string, key: string) => {
        let json: IHistoryData | ISumByNameData | ISumByDayData = { list: [], sum: 0 };
        try {
            const q = query(collection(db, collectionName), where(DocumentId, '==', key));
            const result = await getDocs(q);
            if (!result.empty) { json = result.docs[0].data() as any; }
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const getRange = async (collectionName: string, keys: string[] = []) => {
        let json: {[key: string]: IHistoryData | ISumByNameData | ISumByDayData} = {};
        try {
            let q;
            if (keys.length > 0) {
                q = query(collection(db, collectionName), where(DocumentId, 'in', keys));
            } else {
                q = collection(db, collectionName);
            }
            const result = await getDocs(q);
            result.forEach(_doc => {
                json[_doc.id] = _doc.data() as any;
            });
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const remove = async (collectionName: string, key: string) => {
        try {
            await deleteDoc(doc(collection(db, collectionName), key));
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const logAllRecord = async () => {
        for (const collectionName of Object.values(CloudCollection)) {
            const result = await getRange(collectionName);
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
