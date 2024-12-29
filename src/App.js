import React, { useEffect, useState } from 'react';
import { Button, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import useAuth from './hook/useAuth';
import useFirebase from './hook/useFirebase';
import useLanguage from './hook/useLanguage';
import useLocalStorage from './hook/useLocalStorage';
import { getDayInMonth } from './util/DateTimeUtil';
import { formatNumber } from './util/NumberFormatUtil';

function App() {
	useAuth();
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const [sum, setSum] = useState({});
	const [record, setRecord] = useState({});
	const [inputData, setInputData] = useState({
		name: '',
		value: '',
		tag: [],
	});
	const { name, value, tag } = inputData;
	const [date, setDate] = useState({
		dateString: '',
		year: '',
		month: '',
		day: '',
		timestamp: 0,
	});
	const { dateString, year, month, day, timestamp } = date;
	const key = `${year}-${month}-${day}`;
	const [dropdownItem, setDropdownItem] = useState([
		{label: language.get('dropdown.food'), value: 'food'},
		{label: language.get('dropdown.entertainment'), value: 'entertainment'},
	]);
	const [group, setGroup] = useState(dropdownItem[0]);

	useEffect(() => {
		const current = new Date();
		const _year = current.getFullYear();
		const _month = String(current.getMonth() + 1).padStart(2, '0');
		const _day = String(new Date().getDate()).padStart(2, '0');
        initRecordList(_year, _month, _day);
	}, []);

	const initRecordList = async (_year, _month, _day) => {
		for (const d of getDayInMonth(_year, month)) {
			const _key = `${_year}-${_month}-${d}`;
			const history = await localStorage.get(_key);
			setRecord(prev => {
				prev[_key] = Array.isArray(history) ? history : [];
				return {...prev};
			});
			setSum(prev => {
				prev[_key] = 0;
				(Array.isArray(history) ? history : []).forEach(item => {
					prev[_key] += item.value;
				});
				return {...prev};
			});
		}
		setDate({dateString: `${_year}-${_month}-${_day}`, timestamp: new Date(`${_year}-${_month}-${_day}`), year: _year, month: _month, day: _day});
	};

	const onSync = async () => {
		const result = await localStorage.getAll();
		for (const _key of Object.keys(result)) {
			await cloudStorage.set(_key, result[_key]);
		}
	};

	const onConfirm = async () => {
		if (value.length === 0 || !date) { return; }

		const _history = record?.[key] ?? [];
		const data = {
			id: _history.length > 0 ? _history[_history.length - 1].id + 1 : 1,
			timestamp: timestamp,
			name: name,
			value: Number(value),
			group: group.value,
			tag: tag.length > 0 ? tag.split(',') : [],
		};
		const list = [..._history, data];
		await localStorage.set(dateString, list);
		setRecord(prev => {
			prev[dateString] = list;
			return {...prev};
		});
		setSum((prev) =>{
			prev[dateString] += Number(value);
			return {...prev};
		});
		setInputData({ name: '', value: '', tag: [] });
	};

	const onClear = async (item) => {
		const newRecord = record?.[key]?.filter(x => x.id !== item.id);
		await localStorage.set(dateString, newRecord);
		setRecord(prev => {
			prev[dateString] = newRecord;
			return {...prev};
		});
		setSum((prev) =>{
			prev[dateString] -= Number(item.value);
			return {...prev};
		});
	};

	return (<SafeAreaView >
		<StatusBar />
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View>
				<Button
					title={language.get('sync')}
					onPress={onSync}
				/>
				<Calendar
					onDayPress={setDate}
					onMonthChange={item => {
						setRecord([]);
						setSum({});
						const _year = String(item.year);
						const _month = String(item.month).padStart(2, '0');
						const _day = String(item.day).padStart(2, '0');
						initRecordList(_year, _month, _day);
					}}
					// eslint-disable-next-line react/no-unstable-nested-components
					dayComponent={props => {
						const { date: _date, onPress, children } = props;
						const _key = `${_date.year}-${String(_date.month).padStart(2, '0')}-${String(_date.day).padStart(2, '0')}`;
						return (
							<TouchableOpacity
								style={[styles.dayContainer, dateString === _date.dateString ? styles.selectedDay : '']}
								onPress={() => { requestAnimationFrame(() => onPress(_date)); }}
							>
								<Text style={styles.day}>{children}</Text>
								<Text style={styles.redText}>{formatNumber(sum[_key])}</Text>
							</TouchableOpacity>
						);
					}}
					hideExtraDays
				/>
				<TextInput
					onChangeText={e => setInputData(prev => ({...prev, name: e}))}
					value={name}
					placeholder={language.get('shop.name')}
				/>
				<TextInput
					onChangeText={e => setInputData(prev => ({...prev, value: e}))}
					value={value}
					inputMode="decimal"
					placeholder={language.get('price')}
				/>
				<Dropdown style={styles.dropdown}
					value={group}
					items={dropdownItem}
					onChange={e => setGroup(e.value)}
					data={dropdownItem}
					maxHeight={300}
					labelField="label"
					valueField="value"
				/>
				<TextInput
					autoCapitalize="none"
					onChangeText={e => setInputData(prev => ({...prev, tag: e}))}
					value={tag}
					multiline numberOfLines={5}
					placeholder={language.get('tag.description')}
				/>
				<Button
					title={language.get('confirm')}
					onPress={onConfirm}
					disabled={value.length === 0 || !date}
				/>
				<Text style={styles.header}>
					{language.get('date')}: {dateString.toString()}&nbsp;
					{language.get('sum')}: {formatNumber(sum[key])}
				</Text>
				<ScrollView style={styles.record} nestedScrollEnabled={true}>
				{
					record?.[key]?.map(item => {
						return <View style={styles.listItem} key={item.id}>
							<Text>
								{language.get('shop.name')}: {item.name}{'\n'}
								{language.get('price')}: {formatNumber(item.value)}{'\n'}
								{/* {language.get('tag')}: {item.tag?.map(_tag => {
									return <Text key={_tag}>{_tag}, </Text>;
								})} */}
							</Text>
							<Pressable style={styles.clearButton}
								onPress={() => onClear(item)}
							>
								<Text style={styles.clearYext}>{language.get('clear')}</Text>
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
	dayContainer: { width: '100%' },
	day: {textAlign: 'center'},
	selectedDay: {color: 'purple', backgroundColor: 'lightblue'},
	dropdown: {paddingLeft: '4'},
	header: {textAlign: 'center'},
	message: {color:'red'},
	record: {height: '300', overflow: 'hidden'},
	listItem: {position: 'relative'},
	clearButton: {position: 'absolute', top: '0', right: '0'},
	redText: {color: 'red', textAlign: 'center'},
	clearYext: {color: 'red'},
});

export default App;
