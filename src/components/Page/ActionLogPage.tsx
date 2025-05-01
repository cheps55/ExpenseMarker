import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import useLocalStorage from '../../hook/useLocalStorage';
import { IActionItem } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import useLanguage from './../../hook/useLanguage';

const ActionLogPage = ({
    onBack,
}: {
    onBack: () => void;
}) => {
    const language = useLanguage();
	const localStorage = useLocalStorage();

	const [list, setList] = useState<IActionItem[]>([]);

    useEffect(() => {
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const init = async () => {
        setList((await localStorage.getActionLog()).list);
    };

    const clearLog = async () => {
        await localStorage.setActionLog({list: []});
        setList([]);
    };

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
            <View>
                <Button title={language.get('go_back')} onPress={onBack} />
                <Button title={language.get('clear_action_log')} color="red" onPress={clearLog} />
            </View>
            <ScrollView>
				{
                    list.map((item) => {
                        const { uniqueId, action, updated } = item;
                        return <View style={[styles.listItem]} key={`${uniqueId}${action}`}>
                            <Text>
                                {getFormatDate(updated)} | {action} | {uniqueId}
                            </Text>
                        </View>;
                    })
                }
			</ScrollView>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	listItem: { padding: 4 },
});

export default ActionLogPage;
