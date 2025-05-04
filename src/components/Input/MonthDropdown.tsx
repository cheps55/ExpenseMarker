import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { IInputDate } from '../../interface/DataInterface';

const months = [
    { label: 'Jan', value: '01' },
    { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' },
    { label: 'May', value: '05' },
    { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' },
    { label: 'Aug', value: '08' },
    { label: 'Sep', value: '09' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
];

type MonthItem = {label: string, value: string};

const MonthDropdown = ({
    date, onChange,
}: {
    date: IInputDate,
    onChange: (item: {value: string}) => void,
}) => {
    const { month } = date;

    return <Dropdown
        style={styles.month}
        selectedTextStyle={styles.selectedText}
        iconStyle={styles.icon}
        value={month}
        onChange={onChange}
        data={months}
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
    month: { width: 80 },
    selectedText: { textAlign: 'center' },
    icon: { position: 'absolute', right: 4 },
    item: { padding: 0 },
    textItem: { fontSize: 16, textAlign: 'center' },
});

export default MonthDropdown;
