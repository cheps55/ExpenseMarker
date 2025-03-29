import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import useLocalStorage from '../../hook/useLocalStorage';
import { IHistoryData, ISumByNameData } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import SuggestionInput, { SuggestionInputType } from '../Input/SuggestionInput';

const SearchPage = () => {
	const localStorage = useLocalStorage();

	const [data, setData] = useState<SuggestionInputType>({text: '', isExists: false});
	const { text, isExists }= data;
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

    const setState = (_data: SuggestionInputType) => {
        setData(_data);
    };

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic">
            <View>
                <SuggestionInput
                    state={text}
                    setState={setState}
                    suggestionList={nameList}
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
