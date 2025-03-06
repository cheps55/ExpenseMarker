import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import GlobalStyles from '../../css/GlobalCss';
import { GroupType } from '../../enum/InputEnum';
import useLanguage from '../../hook/useLanguage';
import { IEditData, IInputData } from '../../interface/DataInterface';

const InputForm = ({
    state, setState, suggestionList = [],
}: {
    state: IInputData | IEditData,
    setState: React.Dispatch<React.SetStateAction<IInputData>> | React.Dispatch<React.SetStateAction<IEditData>>
    suggestionList?: string[],
}) => {
    const { name, value, group, tag } = state;
    const language = useLanguage();

    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const dropdownItem: {label: string, value: keyof typeof GroupType}[] = useMemo(() => {
        return Object.keys(GroupType).map(key => ({value: key as keyof typeof GroupType, label: language.get(`dropdown.${key}`)}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (group?.length === 0) {
            setState((prev: any) => ({...prev, group: dropdownItem[0].value}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const handleNameChange = (text: string) => {
        setState((prev: any) => ({ ...prev, name: text }));
        if (text.length > 0) {
            const filtered = suggestionList.filter(suggestion => suggestion.toLowerCase().includes(text.toLowerCase()));
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    };

    return <>
        <View style={styles.nameInput}>
            <TextInput
                onChangeText={handleNameChange}
                value={name}
                placeholder={language.get('shop.name')}
            />
            {filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <Pressable
                            key={index}
                            onPress={() => {
                                setState((prev: any) => ({ ...prev, name: suggestion }));
                                setFilteredSuggestions([]);
                            }}
                        >
                            <Text style={styles.suggestionItem}>{suggestion}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
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
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
});

export default InputForm;
