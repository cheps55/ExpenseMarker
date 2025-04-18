import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { IHistoryData, ISumByNameData } from '../../interface/DataInterface';
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

    const init = async () => {
        setNameList(await localStorage.getAllNameKeys());
    };

    const getRecord = async () => {
        const result = (await localStorage.get(text)) as ISumByNameData;
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

        for (let i = 0; i < byNameList.length; i++) {
            const key: string = byNameList[i];
            let item = _list[key];
            item.name = renameText;
            byNameSum = addNumber([byNameSum, item.value]);
            await localStorage.set(key, item);
        }
        await localStorage.set(renameText, {list: byNameList, sum: byNameSum});
        await localStorage.remove(text);
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
                    disabled={text.length === 0 || renameText.length === 0}
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
