import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { Action, SettingType } from '../../enum/ActionEnum';
import { CloudCollection } from '../../enum/CollectionEnum';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { ILastSync } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import { isHistoryData, isSumByDayData, isSumByNameData } from '../../util/ValidationUtil';
import ConfirmPopUp from '../PopUp/ConfirmPopUp';
import ActionLogPage from './ActionLogPage';

const SettingPage = () => {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

    const [lastSync, setLastSync] = useState<ILastSync>({to: 0, from: 0});
    const { from, to } = lastSync;
    const [actionType, setSettingType] = useState('');
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

    const onConfirm = async () => {
        let newSyncTime: ILastSync = {to: 0, from: 0};
        let promiseList: Promise<void>[] = [];

        switch(actionType) {
            case SettingType.deleteLocal:
                promiseList.push(localStorage.clear());
                break;
            case SettingType.backUp:
                promiseList.push(cloudStorage.cloneHistoryRecord());
                break;
            case SettingType.syncFrom:
                const commonGetProps = {timestamp: from};
                const history = await cloudStorage.getRange({collectionName: CloudCollection.History, ...commonGetProps});
                const byName = await cloudStorage.getRange({collectionName: CloudCollection.SumByName, ...commonGetProps});
                const byDay = await cloudStorage.getRange({collectionName: CloudCollection.SumByDay, ...commonGetProps});
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
                promiseList.push(localStorage.setLastSync(newSyncTime));
                break;
            case SettingType.syncTo:
                const actionLog = await localStorage.getActionLog();
                if (actionLog) {
                    const _history = actionLog.list.filter(key => key.action === Action.update && isHistoryData(key.uniqueId));
                    const _byName = actionLog.list.filter(key => key.action === Action.update && isSumByNameData(key.uniqueId));
                    const _byDay = actionLog.list.filter(key => key.action === Action.update && isSumByDayData(key.uniqueId));
                    const deleted = actionLog.list.filter(key => key.action === Action.delete);

                    if (deleted.length > 0) {
                        for (const key of deleted) {
                            let collection: string = CloudCollection.History;
                            if (isSumByNameData(key.uniqueId)) { collection = CloudCollection.SumByName; }
                            if (isSumByDayData(key.uniqueId)) { collection = CloudCollection.SumByDay; }
                            promiseList.push(cloudStorage.remove(collection, key.uniqueId));
                        }
                    }

                    for (const key of _history) {
                        const data = await localStorage.get(key.uniqueId);
                        promiseList.push(cloudStorage.set(CloudCollection.History, key.uniqueId, data));
                    }
                    for (const key of _byName) {
                        const data = await localStorage.get(key.uniqueId);
                        promiseList.push(cloudStorage.set(CloudCollection.SumByName, key.uniqueId, data));
                    }
                    for (const key of _byDay) {
                        const data = await localStorage.get(key.uniqueId);
                        promiseList.push(cloudStorage.set(CloudCollection.SumByDay, key.uniqueId, data));
                    }

                    promiseList.push(localStorage.setActionLog({list: []}));
                }
                newSyncTime = {from, to: Date.now()};
                promiseList.push(localStorage.setLastSync(newSyncTime));
                break;
            default:
                break;
        }

        await Promise.all(promiseList);
        if ([SettingType.syncFrom, SettingType.syncTo].some(x => x === actionType)) {
            setLastSync(newSyncTime);
        }
        setIsConfirmPopUpOpen(false);
    };

    const getButtonTitle = (type: keyof typeof SettingType) => {
        const timestamp = type === SettingType.syncFrom ? from : to;
        let str: string = language.get(type);
        str += `${[SettingType.syncFrom, SettingType.syncTo].some(x => x === type) ? `(${language.get('sync.last_sync')}: ${getFormatDate(timestamp)})` : ''}${isConnected ? '' : ` ${language.get('no_internet')}`}`;
        return str;
    };

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        {
            isShowActionLog
            ? <ActionLogPage onBack={() => { setIsShowActionLog(false); }} />
            : <View style={styles.container}>
                <Button
                    title={getButtonTitle(SettingType.deleteLocal)}
                    color="red"
                    onPress={() => { setSettingType(SettingType.deleteLocal); setIsConfirmPopUpOpen(true); }}
                />
                <Button
                    title={getButtonTitle(SettingType.backUp)}
                    color="blue"
                    onPress={() => { setSettingType(SettingType.backUp); setIsConfirmPopUpOpen(true); }}
                />
                <Button
                    title={getButtonTitle(SettingType.syncFrom)}
                    onPress={() => { setSettingType(SettingType.syncFrom); setIsConfirmPopUpOpen(true); }}
                    disabled={!isConnected}
                />
                <Button
                    title={getButtonTitle(SettingType.syncTo)}
                    color="green"
                    onPress={() => { setSettingType(SettingType.syncTo); setIsConfirmPopUpOpen(true); }}
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
            title={language.get('confirm') + language.get(actionType)}
            onConfirm={onConfirm} onClose={() => {setSettingType(''); setIsConfirmPopUpOpen(false);}}
        />}
    </ScrollView>;
}

const styles = StyleSheet.create({
	container: { width: '100%', display: 'flex', gap: 8 },
});

export default SettingPage;
