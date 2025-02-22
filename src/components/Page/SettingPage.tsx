import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { CloudCollection, LocalStorageKey } from '../../enum/CollectionEnum';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { ISumByDayData } from '../../interface/DataInterface';
import { isDeletedList, isHistoryData, isSumByDayData, isSumByNameData } from '../../util/ValidationUtil';
import ConfirmPopUp from '../PopUp/ConfirmPopUp';

const SyncType = Object.freeze({
    from: 'from',
    to: 'to',
    oldToNew: 'oldToNew',
})

const SettingPage = () => {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

    const [syncType, setSyncType] = useState('');
    const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

    const convertToNewStructure = async () => {
        const cloud: any = await cloudStorage.getRange(CloudCollection.Record);
        if (cloud) {
            let list: any = {};
            for (const key of Object.keys(cloud)) {
                for (const item of cloud[key].list) {
                    if (!list[item.name]) { list[item.name] = {}; }
                    if (!list[key]) { list[key] = {}; }
                    const _item = {...item, uniqueId: String(item.timestamp + item.id)};
                    list = {
                        ...list,
                        [_item.name]: {
                            ...list[_item.name],
                            sum: (list[_item.name].sum ?? 0) + _item.value,
                            list: [...list[_item.name].list ?? [], _item.uniqueId],
                        },
                        [key]: {
                            ...list[key],
                            sum: (list[key].sum ?? 0) + _item.value,
                            list: [...list[key].list ?? [], _item.uniqueId],
                        },
                    };
                    await cloudStorage.set(CloudCollection.History, String(_item.uniqueId), _item);
                }
            }

            for (const key of Object.keys(list)) {
                const _collection = key.includes('-') ? CloudCollection.SumByDay : CloudCollection.SumByName;
                await cloudStorage.set(_collection, key, list[key]);
            }
        }
    };

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
                if (deleted) {
                    for (const key of (all[LocalStorageKey.deleteRecord] as ISumByDayData).list) {
                        let collection: string = CloudCollection.History;
                        if (isSumByNameData(key)) { collection = CloudCollection.SumByName; }
                        if (isSumByDayData(key)) { collection = CloudCollection.SumByDay; }
                        await cloudStorage.remove(collection, key);
                    }
                    await localStorage.set(LocalStorageKey.deleteRecord, { list: [], sum: -1 });
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

        if (syncType === SyncType.oldToNew) {
            await convertToNewStructure();
        }
        setIsConfirmPopUpOpen(false);
    };

    const onDeleteAllLocal = async () => {
        await localStorage.clear();
    };

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.container}>
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
            <Button
                title={`${'Old to new data'}${isConnected ? '' : ` ${language.get('no_internet')}`}`}
                color="purple"
                onPress={() => { setSyncType(SyncType.oldToNew); setIsConfirmPopUpOpen(true); }}
                disabled={!isConnected}
            />
            <Button
                title={`${'Delete all local'}`}
                color="red"
                onPress={() => { onDeleteAllLocal(); }}
            />
        </View>
        {isConfirmPopUpOpen && <ConfirmPopUp
            title={language.get('confirm') + language.get(`sync.${syncType}`)}
            onConfirm={onSync} onClose={() => {setSyncType(''); setIsConfirmPopUpOpen(false);}}
        />}
    </ScrollView>;
}

const styles = StyleSheet.create({
	container: { width: '100%', display: 'flex', gap: 4 },
});

export default SettingPage;
