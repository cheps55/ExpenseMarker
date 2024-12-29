import React, { useEffect, useState } from 'react';
import { Button, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import useAuth from './hook/useAuth';
import useFirebase from './hook/useFirebase';
import useLocalStorage from './hook/useLocalStorage';
import { getDayInMonth } from './util/DateTimeUtil';
import { formatNumber } from './util/NumberFormatUtil';

function App() {
	useAuth();
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();

	const [sum, setSum] = useState(0);
	const [record, setRecord] = useState({});
	const [value, setValue] = useState('');
	const [tag, setTag] = useState('');
	const [date, setDate] = useState({
		dateString: '',
		year: '',
		month: '',
		day: '',
		timestamp: 0,
	});
	const { dateString, year, month, day, timestamp } = date;
	const [dropdownItem, setDropdownItem] = useState([
		{label: 'Food', value: 'food'},
		{label: 'Entertainment', value: 'entertainment'},
	]);
	const [group, setGroup] = useState(dropdownItem[0]);

	useEffect(() => {
		const initData = async () => {
			const current = new Date();
			const _year = current.getFullYear();
			const _month = String(current.getMonth() + 1).padStart(2, '0');
			const _day = String(new Date().getDate()).padStart(2, '0');
			setDate({dateString: `${_year}-${_month}-${_day}`, timestamp: new Date(`${_year}-${_month}-${_day}`), year: _year, month: _month, day: _day});
			for (const d of getDayInMonth(_year, month)) {
				const history = await localStorage.get(`${_year}-${_month}-${d}`);
				setRecord(prev => {
					prev[d] = Array.isArray(history) ? history : [];
					return prev;
				});
			}
        };
        initData();
	}, []);

	useEffect(() => {
		record?.[day]?.forEach(item => {
			setSum((prev) =>{
				prev += Number(item.value);
				return prev;
			});
		})
	}, [dateString]);

	const onSync = async () => {
		const result = await localStorage.getAll();
		for (const key of Object.keys(result)) {
			await cloudStorage.set(key, result[key]);
		}
	};

	const onConfirm = async () => {
		if (value.length === 0 || !date) { return; }

		const _history = record?.[day] ?? [];
		const data = {
			id: _history.length > 0 ? _history[_history.length - 1].id + 1 : 1,
			timestamp: timestamp,
			value: value,
			group: group.value,
			tag: tag.split(','),
		};
		const list = [..._history, data];
		await localStorage.set(dateString, list);
		setSum((prev) =>{
			prev += Number(value);
			return prev;
		});
		setRecord(prev => {
			prev[day] = list;
			return prev;
		});
	};

	const onClear = async (item) => {
		const newRecord = record?.[day]?.filter(x => x.id !== item.id);
		await localStorage.set(dateString, newRecord);
		setSum((prev) =>{
			prev -= Number(item.value);
			return prev;
		});
		setRecord(prev => {
			prev[day] = newRecord;
			return prev;
		});
	};

	const getMarkedDate = () => {
		let marked = {
			[dateString]: {selected: true, disableTouchEvent: true},
		};
		Object.keys(record ?? {}).forEach(key => {
			const dayRecord = record[key];
			if (dayRecord.length > 0) {
				const _key = `${year}-${month}-${key}`;
				marked[_key] = {...marked[_key], marked: true, dotColor: 'red'};
			}
		});
		return marked;
	};

	return (<SafeAreaView >
		<StatusBar />
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View>
				<Button
					title="Sync"
					onPress={onSync}
				/>
				<Calendar
					onDayPress={setDate}
					markedDates={getMarkedDate()}
				/>
				<TextInput
					onChangeText={setValue}
					value={value}
					inputMode="decimal"
					placeholder="price"
				/>
				<Dropdown
					value={group}
					items={dropdownItem}
					onChange={item => {
						setGroup(item.value);
					}}
					data={dropdownItem}
					maxHeight={300}
					labelField="label"
					valueField="value"
					placeholder="Select item"
				/>
				<TextInput
					autoCapitalize="none"
					onChangeText={setTag}
					value={tag}
					multiline numberOfLines={5}
					placeholder="tag: use ',' to split"
				/>
				<Button
					title="Confirm"
					onPress={onConfirm}
				/>
				<Text style={styles.header}>Date: {dateString.toString()} Sum: {formatNumber(sum)}</Text>
				<ScrollView style={styles.record} nestedScrollEnabled={true}>
				{
					record?.[day]?.map(item => {
						return <View style={styles.listItem} key={item.id}>
							<Text>
								{item.id}:{'\n'}
								Value: {formatNumber(item.value)}{'\n'}
								Tag: {item.tag?.map(_tag => {
									return <Text key={_tag}>{_tag}, </Text>;
								})}
							</Text>
							<Pressable style={styles.clearButton}
								onPress={() => onClear(item)}
							>
								<Text  style={styles.clearText}>Clear</Text>
							</Pressable>
						</View>;
					})
				}
  				</ScrollView>
			</View>
		</ScrollView>
	</SafeAreaView>);
}

const styles = StyleSheet.create({
	header: {textAlign: 'center'},
	message: {color:'red'},
	record: {height: '300', overflow: 'hidden'},
	listItem: {position: 'relative'},
	clearButton: {position: 'absolute', top: '0', right: '0'},
	clearText: {color: 'red'},
});

export default App;
