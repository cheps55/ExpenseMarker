import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IInputDate } from '../../interface/DataInterface';

const years = Array.from({length: 21}, (_, i) => ({label: String(i + 2024), value: String(i + 2024)}));

type MonthItem = {label: string, value: string};

const YearDropdown = ({
    date, onChange,
}: {
    date: IInputDate,
    onChange: (item: {value: string}) => void,
}) => {
    const { year } = date;

    return <Dropdown
        style={styles.year}
        selectedTextStyle={styles.selectedText}
        iconStyle={styles.icon}
        value={year}
        onChange={onChange}
        data={years}
        renderItem={(item: MonthItem) => {
            return <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>;
        }}
        labelField="label"
        valueField="value"
    />;
};

const styles = StyleSheet.create({
    year: { width: 80 },
    selectedText: { textAlign: 'center' },
    icon: { position: 'absolute', right: 4 },
    item: { padding: 0 },
    textItem: { fontSize: 16, textAlign: 'center' },
});

export default YearDropdown;
