import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { Action } from '../../enum/ActionEnum';
import { CloudCollection } from '../../enum/CollectionEnum';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
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

    const [syncType, setSyncType] = useState('');
    const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
    const [isShowActionLog, setIsShowActionLog] = useState(false);

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
                        await cloudStorage.remove(collection, key.uniqueId);
                    }
                }

                for (const key of history) {
                    const data = await localStorage.get(key.uniqueId);
                    await cloudStorage.set(CloudCollection.History, key.uniqueId, data);
                }
                for (const key of byName) {
                    const data = await localStorage.get(key.uniqueId);
                    await cloudStorage.set(CloudCollection.SumByName, key.uniqueId, data);
                }
                for (const key of byDay) {
                    const data = await localStorage.get(key.uniqueId);
                    await cloudStorage.set(CloudCollection.SumByDay, key.uniqueId, data);
                }

                await localStorage.setActionLog({list: []});
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
