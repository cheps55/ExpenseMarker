import React, { useEffect, useState } from 'react';
import { Button, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import InputForm from './components/Form/InputForm';
import ConfirmPopUp from './components/PopUp/ConfirmPopUp';
import EditPopUp from './components/PopUp/EditPopUp';
import GlobalStyles from './css/GlobalCss';
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
	const initialInputData = {
		name: '',
		value: '',
		group: '',
		tag: '',
	};
	const [inputData, setInputData] = useState(initialInputData);
	const { name, value, group, tag } = inputData;
	const [date, setDate] = useState({
		dateString: '',
		year: '',
		month: '',
		day: '',
		timestamp: 0,
	});
	const { dateString, year, month, day, timestamp } = date;
	const key = `${year}-${month}-${day}`;

	const [syncType, setSyncType] = useState('');
	const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
	const [selectedEdit, setSelectedEdit] = useState({});
	const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);

	useEffect(() => {
		const current = new Date();
		const _year = current.getFullYear();
		const _month = String(current.getMonth() + 1).padStart(2, '0');
		const _day = String(new Date().getDate()).padStart(2, '0');
        initRecordList(_year, _month, _day);
	}, []);

	const initRecordList = async (_year, _month, _day) => {
		let keys = [];
		for (const d of getDayInMonth(Number(_year), Number(_month))) { keys.push(`${_year}-${_month}-${d}`); }
		const result = await localStorage.getRange(keys);
		for (const _key of Object.keys(result)) {
			const _data = Array.isArray(result[_key]) ? result[_key] : [];
			setRecord(prev => {
				prev[_key] = _data;
				return {...prev};
			});
			setSum(prev => {
				prev[_key] = 0;
				_data.forEach(item => { prev[_key] += item.value; });
				return {...prev};
			});
		}
		setDate({dateString: `${_year}-${_month}-${_day}`, timestamp: new Date(`${_year}-${_month}-${_day}`).valueOf(), year: _year, month: _month, day: _day});
	};

	const onSync = async () => {
		if (syncType === 'from') {
			const cloud = await cloudStorage.getRange();
			for (const _key of Object.keys(cloud)) { await localStorage.set(_key, cloud[_key]); }
		}

		if (syncType === 'to') {
			const local = await localStorage.getRange();
			for (const _key of Object.keys(local)) { await cloudStorage.set(_key, local[_key]); }
		}
		setIsConfirmPopUpOpen(false);
	};

	const isDisableConfirmButton = () => {
		return (
			name.length === 0 || value.length === 0 || !date ||
			typeof Number(value) !== 'number' || isNaN(Number(value)) || Number(value) < 0
		);
	};

	const onConfirm = async () => {
		const _history = record?.[key] ?? [];
		const data = {
			id: _history.length > 0 ? _history[_history.length - 1].id + 1 : 1,
			timestamp: timestamp,
			name: name,
			value: Number(value),
			group: group,
			tag: tag.length > 0 ? tag.split(',') : [],
		};
		const list = [..._history, data];
		await localStorage.set(key, list);
		setRecord(prev => {
			prev[key] = list;
			return {...prev};
		});
		setSum((prev) =>{
			prev[key] += Number(value);
			return {...prev};
		});
		setInputData(initialInputData);
	};

	const onEdit = async (editData) => {
		let oldData = record?.[key].find(x => x.id === editData.id);
		const oldValue = oldData.value;
		oldData.name = editData.name;
		oldData.value = Number(editData.value);
		oldData.group = editData.group;
		oldData.tag = editData.tag.length > 0 ? editData.tag.split(',') : [];

		await localStorage.set(key, record?.[key]);
		setRecord(prev => {
			prev[key] = record?.[key];
			return {...prev};
		});
		setSum((prev) =>{
			prev[key] -= oldValue;
			prev[key] += Number(editData.value);
			return {...prev};
		});
		setIsEditPopUpOpen(false);
		setSelectedEdit({});
	};

	const onClear = async (data) => {
		const newRecord = record?.[key]?.filter(x => x.id !== data.id);
		await localStorage.set(dateString, newRecord);
		setRecord(prev => {
			prev[dateString] = newRecord;
			return {...prev};
		});
		setSum((prev) =>{
			prev[dateString] -= Number(data.value);
			return {...prev};
		});
		setIsEditPopUpOpen(false);
		setSelectedEdit({});
	};

	return (<SafeAreaView >
		<StatusBar />
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View>
				<View>
					<Button
						title={language.get('sync.from')}
						onPress={() => { setSyncType('from'); setIsConfirmPopUpOpen(true); }}
					/>
					<Button
						title={language.get('sync.to')}
						onPress={() => { setSyncType('to'); setIsConfirmPopUpOpen(true); }}
					/>
				</View>
				<Calendar
					onDayPress={item => {
						setDate({
							dateString: item.dateString,
							year: String(item.year),
							month: String(item.month).padStart(2, '0'),
							day: String(item.day).padStart(2, '0'),
							timestamp: item.timestamp,
						});
					}}
					onMonthChange={item => {
						setRecord({});
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
				<InputForm state={inputData} setState={setInputData} />
				<Button
					title={language.get('confirm')}
					onPress={onConfirm}
					disabled={isDisableConfirmButton()}
				/>
				<Text style={styles.header}>
					{language.get('date')}: {dateString.toString()}&nbsp;
					{language.get('sum')}: {formatNumber(sum[key])}
				</Text>
				<ScrollView style={styles.record} nestedScrollEnabled={true}>
				{
					record?.[key]?.map(item => {
						return <View style={[styles.listItem, styles[`group_${item.group}`]]} key={item.id}>
							<Pressable onPress={() => { setSelectedEdit(item); setIsEditPopUpOpen(true);}}>
								<Text>
									{language.get('shop.name')}: {item.name}{'\n'}
									{language.get('price')}: {formatNumber(item.value)}{'\n'}
								</Text>
							</Pressable>
						</View>;
					})
				}
			</ScrollView>
		</View>
		{isConfirmPopUpOpen && <ConfirmPopUp
			title={language.get('confirm') + language.get(`sync.${syncType}`)}
			onConfirm={onSync} onClose={() => {setSyncType(''); setIsConfirmPopUpOpen(false);}}
		/>}
		{isEditPopUpOpen && <EditPopUp
			data={selectedEdit}
			onConfirm={onEdit} onClose={() => {setSelectedEdit({}); setIsEditPopUpOpen(false);}} 
			onClear={onClear}
		/>}
		</ScrollView>
	</SafeAreaView>);
}

const styles = StyleSheet.create({
	dayContainer: { width: '100%' },
	day: {textAlign: 'center'},
	selectedDay: {color: 'purple', backgroundColor: 'lightblue'},
	header: {textAlign: 'center'},
	message: {color:'red'},
	record: {height: 300, overflow: 'hidden'},
	listItem: { padding: 4 },
	redText: {color: 'red', textAlign: 'center'},
	clearYext: {color: 'red'},
	group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
});

export default App;
