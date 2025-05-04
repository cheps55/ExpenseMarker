import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { Action } from '../../enum/ActionEnum';
import { CloudCollection } from '../../enum/CollectionEnum';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { ILastSync } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import { isHistoryData, isSumByDayData, isSumByNameData } from '../../util/ValidationUtil';
import ConfirmPopUp from '../PopUp/ConfirmPopUp';
import ActionLogPage from './ActionLogPage';

const SyncType = Object.freeze({
    from: 'from',
    to: 'to',
})

const SettingPage = () => {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

    const [lastSync, setLastSync] = useState<ILastSync>({to: 0, from: 0});
    const { from, to } = lastSync;
    const [syncType, setSyncType] = useState('');
    const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
    const [isShowActionLog, setIsShowActionLog] = useState(false);

    useEffect(() => {
        initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initData = async () => {
        const data = await localStorage.getLastSync();
        setLastSync(data);
    };

    const onSync = async () => {
        let newSyncTime: ILastSync = {to: 0, from: 0};
        let promiseList: Promise<void>[] = [];

        if (syncType === SyncType.from) {
            const history = await cloudStorage.getRange(CloudCollection.History);
            const byName = await cloudStorage.getRange(CloudCollection.SumByName);
            const byDay = await cloudStorage.getRange(CloudCollection.SumByDay);
            if (history || byName || byDay) {
                for (const key of Object.keys(history)) {
                    promiseList.push(localStorage.set(key, history[key]));
                }
                for (const key of Object.keys(byName)) {
                    promiseList.push(localStorage.set(key, byName[key]));
                }
                for (const key of Object.keys(byDay)) {
                    promiseList.push(localStorage.set(key, byDay[key]));
                }
            }
            newSyncTime = {from: Date.now(), to};
        }

        if (syncType === SyncType.to) {
            const actionLog = await localStorage.getActionLog();
            if (actionLog) {
                const history = actionLog.list.filter(key => key.action === Action.update && isHistoryData(key.uniqueId));
                const byName = actionLog.list.filter(key => key.action === Action.update && isSumByNameData(key.uniqueId));
                const byDay = actionLog.list.filter(key => key.action === Action.update && isSumByDayData(key.uniqueId));
                const deleted = actionLog.list.filter(key => key.action === Action.delete);

                if (deleted.length > 0) {
                    for (const key of deleted) {
                        let collection: string = CloudCollection.History;
                        if (isSumByNameData(key.uniqueId)) { collection = CloudCollection.SumByName; }
                        if (isSumByDayData(key.uniqueId)) { collection = CloudCollection.SumByDay; }
                        promiseList.push(cloudStorage.remove(collection, key.uniqueId));
                    }
                }

                for (const key of history) {
                    const data = await localStorage.get(key.uniqueId);
                    promiseList.push(cloudStorage.set(CloudCollection.History, key.uniqueId, data));
                }
                for (const key of byName) {
                    const data = await localStorage.get(key.uniqueId);
                    promiseList.push(cloudStorage.set(CloudCollection.SumByName, key.uniqueId, data));
                }
                for (const key of byDay) {
                    const data = await localStorage.get(key.uniqueId);
                    promiseList.push(cloudStorage.set(CloudCollection.SumByDay, key.uniqueId, data));
                }

                promiseList.push(localStorage.setActionLog({list: []}));
                newSyncTime = {from, to: Date.now()};
            }
        }

        promiseList.push(localStorage.setLastSync(newSyncTime));
        await Promise.all(promiseList);

        setLastSync(newSyncTime);
        setIsConfirmPopUpOpen(false);
    };

    const onDeleteAllLocal = async () => {
        await localStorage.clear();
    };

    const onBackUp = async () => {
        await cloudStorage.cloneHistoryRecord();
    };

    const getSyncButtonTitle = (type: keyof typeof SyncType) => {
        const timestamp = type === SyncType.from ? from : to;
        return `${language.get(`sync.${type}`)}${timestamp > 0 ? `(${language.get('sync.last_sync')}: ${getFormatDate(timestamp)})` : ''}${isConnected ? '' : ` ${language.get('no_internet')}`}`;
    };

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        {
            isShowActionLog
            ? <ActionLogPage onBack={() => { setIsShowActionLog(false); }} />
            : <View style={styles.container}>
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
                    title={getSyncButtonTitle(SyncType.from)}
                    onPress={() => { setSyncType(SyncType.from); setIsConfirmPopUpOpen(true); }}
                    disabled={!isConnected}
                />
                <Button
                    title={getSyncButtonTitle(SyncType.to)}
                    color="green"
                    onPress={() => { setSyncType(SyncType.to); setIsConfirmPopUpOpen(true); }}
                    disabled={!isConnected}
                />
                <Button
                    title={`${language.get('action_log')}`}
                    color="purple"
                    onPress={() => { setIsShowActionLog(true); }}
                />
            </View>
        }
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
