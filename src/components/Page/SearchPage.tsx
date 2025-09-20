import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import useLocalStorage from '../../hook/useLocalStorage';
import { IHistoryData, ISumData } from '../../interface/DataInterface';
import { getFormatDate } from '../../util/DateTimeUtil';
import SuggestionInput, { SuggestionInputType } from '../Input/SuggestionInput';

const SearchPage = () => {
	const localStorage = useLocalStorage();

	const [data, setData] = useState<SuggestionInputType>({text: '', isExists: false});
	const { text, isExists } = data;
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

	return (
		<View style={[styles.container]} >
            <View>
                <SuggestionInput
                    state={text}
                    setState={(_data) => setState(_data, 'text')}
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
		</View>
	);
};

const styles = StyleSheet.create({
    container: { flex: 1 },
	listItem: { padding: 4 },
});

export default SearchPage;
