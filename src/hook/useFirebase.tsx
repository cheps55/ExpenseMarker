import { collection, deleteDoc, doc, getDocs, getFirestore, query, setDoc, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { CloudCollection } from '../enum/CollectionEnum';
import { IHistoryData, ISumData } from '../interface/DataInterface';

const db = getFirestore();
const DocumentId = '__name__';

const useFirebase = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message.length > 0) { console.log('Firebase Storage Error Message: ', message); }
        return () => { setMessage(''); };
    }, [message]);

    const set = async (collectionName: string, key: string, payload: IHistoryData | ISumData) => {
        try {
            await setDoc(doc(collection(db, collectionName), key), payload);
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const get = async ({
        collectionName, documentId, timestamp = 0,
    }: {
        collectionName: string, documentId: string, timestamp?: number
    }) => {
        let json: IHistoryData | ISumData = { list: [], sum: 0, updated: Date.now() };
        try {
            const q = query(collection(db, collectionName), where(DocumentId, '==', documentId), where('updated', '>=', timestamp));
            const result = await getDocs(q);
            if (!result.empty) { json = result.docs[0].data() as any; }
            return json;
        } catch (e: any) {
            setMessage(e.message);
            return json;
        }
    };

    const getRange = async ({
        collectionName, documentIds = [], timestamp = 0,
    }: {
        collectionName: string, documentIds?: string[], timestamp?: number
    }) => {
        let json: {[key: string]: IHistoryData | ISumData} = {};
        try {
            let q;
            if (documentIds.length > 0) {
                q = query(collection(db, collectionName), where(DocumentId, 'in', documentIds), where('updated', '>=', timestamp));
            } else {
                q = query(collection(db, collectionName), where('updated', '>=', timestamp));
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

    const cloneHistoryRecord = async () => {
        const result = await getRange({collectionName: CloudCollection.History});
        Object.keys(result).forEach((key) => {
            const item = result[key];
            set(CloudCollection.BackUp, key, item);
        });
    };

    return {
        set: set,
        get: get,
        getRange: getRange,
        remove: remove,
        cloneHistoryRecord: cloneHistoryRecord,
        message: message,
    };
};

export default useFirebase;
