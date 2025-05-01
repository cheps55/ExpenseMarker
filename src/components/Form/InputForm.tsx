import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import GlobalStyles from '../../css/GlobalCss';
import { GroupType } from '../../enum/InputEnum';
import useLanguage from '../../hook/useLanguage';
import { IEditData, IInputData } from '../../interface/DataInterface';
import SuggestionInput, { SuggestionInputType } from '../Input/SuggestionInput';

type GroupItem = {label: string, value: keyof typeof GroupType};

const InputForm = ({
    state, setState, suggestionList = [],
}: {
    state: IInputData | IEditData,
    setState: React.Dispatch<React.SetStateAction<IInputData>> | React.Dispatch<React.SetStateAction<IEditData>>
    suggestionList?: string[],
}) => {
    const { name, value, group, tag } = state;
    const language = useLanguage();

    const dropdownItem: GroupItem[] = useMemo(() => {
        return Object.keys(GroupType).map(key => ({value: key as keyof typeof GroupType, label: language.get(`dropdown.${key}`)}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (group?.length === 0) {
            setState((prev: any) => ({...prev, group: dropdownItem[0].value}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const setName = ({text}: SuggestionInputType) => { setState((prev: any) => ({...prev, name: text})); };

    return <>
        <SuggestionInput
            state={name}
            setState={setName}
            suggestionList={suggestionList}
        />
        <TextInput
            onChangeText={e => setState((prev: any) => ({...prev, value: e}))}
            value={String(value)}
            inputMode="decimal"
            placeholder={language.get('price')}
        />
        <Dropdown style={styles.dropdown}
            value={group}
            onChange={e => setState((prev: any) => ({...prev, group: e.value}))}
            data={dropdownItem}
            selectedTextStyle={styles[`group_${group}`]}
            renderItem={(item: GroupItem) => {
                return <View style={[styles.item, styles[`group_${item.value}`]]}>
                    <Text style={styles.textItem}>{item.label}</Text>
                </View>;
            }}
            maxHeight={300}
            labelField="label"
            valueField="value"
        />
        <TextInput
            autoCapitalize="none"
            onChangeText={e => setState((prev: any) => ({...prev, tag: e}))}
            value={tag}
            multiline numberOfLines={5}
            placeholder={language.get('tag.description')}
        />
    </>;
};

const styles = StyleSheet.create({
    dropdown: { paddingLeft: 4 },
    item: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: { flex: 1, fontSize: 16 },
    group_: {},
    group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
    nameInput: {
        position: 'relative',
    },
    suggestionsContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        top: 40,
        zIndex: 1,
        width: '100%',
        maxHeight: 150,
        borderColor: 'gray',
        borderWidth: 1,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
});

export default InputForm;
