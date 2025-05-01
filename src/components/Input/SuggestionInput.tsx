import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import useLanguage from '../../hook/useLanguage';

export type SuggestionInputType = { text: string, isExists: boolean };

const SuggestionInput = ({
    state, setState, suggestionList = [], placeholder = '',
}: {
    state: string,
    setState: React.Dispatch<SuggestionInputType>
    suggestionList?: string[],
    placeholder?: string,
}) => {
    const language = useLanguage();

    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleNameChange = (text: string) => {
        let filtered: string[] = [];
        let isExists = false;
        if (text.length > 0) {
            filtered = suggestionList.filter(suggestion => {
                if (suggestion === text) { isExists = true };
                return (suggestion.includes(text) || suggestion.toLowerCase().includes(text.toLowerCase())) &&
                    suggestion !== text && suggestion !== state;
            });
        }
        setFilteredSuggestions(filtered);
        setState({text, isExists});
    };

    return <>
        <View style={styles.nameInput}>
            <TextInput
                onChangeText={handleNameChange}
                value={state}
                placeholder={placeholder ? placeholder : language.get('shop.name')}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {isFocused && filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                        {filteredSuggestions.map((suggestion, index) => (
                            <Pressable
                                key={index}
                                onPress={() => { handleNameChange(suggestion); }}
                            >
                                <Text style={styles.suggestionItem}>{suggestion}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    </>;
};

const styles = StyleSheet.create({
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
        display: 'flex',
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
});

export default SuggestionInput;
