import React, { useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import GlobalStyles from '../../css/GlobalCss';
import { GroupType } from '../../enum/InputEnum';
import useLanguage from '../../hook/useLanguage';
import { IInputData } from '../../interface/InputInterface';

const InputForm = ({
    state, setState,
}: {
    state: IInputData,
    setState: React.Dispatch<React.SetStateAction<IInputData>>
}) => {
    const { name, value, group, tag } = state;
    const language = useLanguage();

    const dropdownItem: {label: string, value: keyof typeof GroupType}[] = ([
        {value: GroupType.food, get label() { return language.get(`dropdown.${this.value}`); }},
        {value: GroupType.entertainment, get label() { return language.get(`dropdown.${this.value}`); }},
    ]);

    useEffect(() => {
        if (group?.length === 0) {
            setState((prev: IInputData) => ({...prev, group: dropdownItem[0].value}));
        }
    }, [state]);

    return <>
        <TextInput
            onChangeText={e => setState((prev: IInputData) => ({...prev, name: e}))}
            value={name}
            placeholder={language.get('shop.name')}
        />
        <TextInput
            onChangeText={e => setState((prev: IInputData) => ({...prev, value: e}))}
            value={String(value)}
            inputMode="decimal"
            placeholder={language.get('price')}
        />
        <Dropdown style={styles.dropdown}
            value={group}
            onChange={e => setState((prev: IInputData) => ({...prev, group: e.value}))}
            data={dropdownItem}
            selectedTextStyle={styles[`group_${group}`]}
            renderItem={(item) => {
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
            onChangeText={e => setState((prev: IInputData) => ({...prev, tag: e}))}
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
    group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
});

export default InputForm;
