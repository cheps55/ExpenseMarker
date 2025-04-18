import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LocalStorageKey } from '../../enum/CollectionEnum';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { IHistoryData, ISumData } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import { addNumber } from '../../util/NumberUtil';
import SuggestionInput, { SuggestionInputType } from '../Input/SuggestionInput';

export type SearchPageInputType = SuggestionInputType & { renameText: string; }

const SearchPage = () => {
    const language = useLanguage();
	const localStorage = useLocalStorage();

	const [data, setData] = useState<SearchPageInputType>({text: '', renameText: '', isExists: false});
	const { text, renameText, isExists } = data;
	const [nameList, setNameList] = useState<string[]>([]);
    const [list, setList] = useState<{[key: string]: IHistoryData}>({});

    useEffect(() => {
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isExists) { getRecord(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExists]);

    useEffect(() => {
        setData((prev) => ({...prev, renameText: text}));
    }, [text]);

    const init = async () => {
        setNameList(await localStorage.getAllNameKeys());
    };

    const getRecord = async () => {
        const result = (await localStorage.get(text)) as ISumData;
        if (result && result.list.length > 0) {
            const _list = (await localStorage.getRange(result.list)) as {[key: string]: IHistoryData};
            setList(_list);
        }
    };

    const setState = (_data: SuggestionInputType, field: 'text' | 'renameText') => {
        setData((prev) => ({...prev, [field]: _data.text, isExists: _data.isExists }));
    };

    const renameRecord = async () => {
        const _list: { [key: string]: IHistoryData; } = JSON.parse(JSON.stringify(list));
        let byNameList: string[] = Object.keys(_list);
        let byNameSum = 0;

        let promiseList: Promise<void>[] = []; 

        for (let i = 0; i < byNameList.length; i++) {
            const key: string = byNameList[i];
            let item = _list[key];
            item.name = renameText;
            byNameSum = addNumber([byNameSum, item.value]);
            promiseList.push(localStorage.set(key, item));
        }

        const deletedList = (await localStorage.get(LocalStorageKey.deleteRecord)) as ISumData;
        const _deleteList = [...deletedList.list, text];
        promiseList.push(...[
            localStorage.set(renameText, {list: byNameList, sum: byNameSum}),
            localStorage.remove(text),
            localStorage.set(LocalStorageKey.deleteRecord, {list: _deleteList, sum: -1}),
        ]);

        await Promise.all(promiseList);
        setData((prev) => ({...prev, text: '', renameText: '', isExists: false}));
    };

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
            <View>
                <SuggestionInput
                    state={text}
                    setState={(_data) => setState(_data, 'text')}
                    suggestionList={nameList}
                />
                <SuggestionInput
                    state={renameText}
                    setState={(_data) => setState(_data, 'renameText')}
                    suggestionList={nameList}
                    placeholder={language.get('rename')}
                />
                <Button
                    title={`${language.get('confirm')} ${language.get('rename')}`}
                    onPress={renameRecord}
                    disabled={(text.length === 0 || renameText.length === 0) && text !== renameText}
                />
            </View>
            <ScrollView>
				{
                    Object.keys(list).reverse().map((key) => {
                        const item = list[key];
                        return <View style={[styles.listItem]} key={key}>
                            <Text>
                                {getFormatDate(item.timestamp)}: {item.value} :
                                {
                                    item.tag.map((_item, index) => {
                                        return <React.Fragment key={_item + index}>
                                            {_item}{index > 0 ? ',' : ''}
                                        </React.Fragment>;
                                    })
                                }
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

export default SearchPage;
