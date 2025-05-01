import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { CloudCollection, LocalStorageKey } from '../../enum/CollectionEnum';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { ISumData } from '../../interface/DataInterface';
import { isDeletedList, isHistoryData, isSumByDayData, isSumByNameData } from '../../util/ValidationUtil';
import ConfirmPopUp from '../PopUp/ConfirmPopUp';

const SyncType = Object.freeze({
    from: 'from',
    to: 'to',
})

const SettingPage = () => {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

    const [syncType, setSyncType] = useState('');
    const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

    const onSync = async () => {
        if (syncType === SyncType.from) {
            const history = await cloudStorage.getRange(CloudCollection.History);
            const byName = await cloudStorage.getRange(CloudCollection.SumByName);
            const byDay = await cloudStorage.getRange(CloudCollection.SumByDay);
            if (history || byName || byDay) {
                for (const key of Object.keys(history)) {
                    await localStorage.set(key, history[key]);
                }
                for (const key of Object.keys(byName)) {
                    await localStorage.set(key, byName[key]);
                }
                for (const key of Object.keys(byDay)) {
                    await localStorage.set(key, byDay[key]);
                }
            }
        }

        if (syncType === SyncType.to) {
            const all = await localStorage.getRange();
            const history = Object.keys(all).filter(key => !isDeletedList(key) && isHistoryData(key));
            const byName = Object.keys(all).filter(key => !isDeletedList(key) && isSumByNameData(key));
            const byDay = Object.keys(all).filter(key => !isDeletedList(key) && isSumByDayData(key));
            const deleted = Object.keys(all).filter(key => isDeletedList(key));
            if (all) {
                if (deleted.length > 0) {
                    for (const key of (all[LocalStorageKey.deleteRecord] as ISumData).list) {
                        let collection: string = CloudCollection.History;
                        if (isSumByNameData(key)) { collection = CloudCollection.SumByName; }
                        if (isSumByDayData(key)) { collection = CloudCollection.SumByDay; }
                        await cloudStorage.remove(collection, key);
                    }
                    await localStorage.set(LocalStorageKey.deleteRecord, { list: [], sum: -1, updated: Date.now() });
                }

                for (const key of history) {
                    await cloudStorage.set(CloudCollection.History, key, all[key]);
                }
                for (const key of byName) {
                    await cloudStorage.set(CloudCollection.SumByName, key, all[key]);
                }
                for (const key of byDay) {
                    await cloudStorage.set(CloudCollection.SumByDay, key, all[key]);
                }
            }
        }

        setIsConfirmPopUpOpen(false);
    };

    const onDeleteAllLocal = async () => {
        await localStorage.clear();
    };

    const onBackUp = async () => {
        await cloudStorage.cloneHistoryRecord();
    };

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.container}>
            <Button
                title={`${language.get('delete_local_data')}`}
                color="red"
                onPress={() => { onDeleteAllLocal(); }}
            />
            <Button
                title={`${language.get('back_up')}`}
                color="blue"
                onPress={() => { onBackUp(); }}
            />
            <Button
                title={`${language.get('sync.from')}${isConnected ? '' : ` ${language.get('no_internet')}`}`}
                onPress={() => { setSyncType(SyncType.from); setIsConfirmPopUpOpen(true); }}
                disabled={!isConnected}
            />
            <Button
                title={`${language.get('sync.to')}${isConnected ? '' : ` ${language.get('no_internet')}`}`}
                color="green"
                onPress={() => { setSyncType(SyncType.to); setIsConfirmPopUpOpen(true); }}
                disabled={!isConnected}
            />
        </View>
        {isConfirmPopUpOpen && <ConfirmPopUp
            title={language.get('confirm') + language.get(`sync.${syncType}`)}
            onConfirm={onSync} onClose={() => {setSyncType(''); setIsConfirmPopUpOpen(false);}}
        />}
    </ScrollView>;
}

const styles = StyleSheet.create({
	container: { width: '100%', display: 'flex', gap: 8 },
});

export default SettingPage;
