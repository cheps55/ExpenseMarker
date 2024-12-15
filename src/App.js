import React, { useEffect, useState } from 'react';
import { Button, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import useLocalStorage from './hook/useStorage';

function App() {
	const localStorage = useLocalStorage();

	const [record, setRecord] = useState([]);
	const [value, setValue] = useState('');
	const [tag, setTag] = useState('');
	const [date, setDate] = useState({
		dateString: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
		timestamp: Date.now(),
	});
	const dataKey = date.dateString;

	useEffect(() => {
		
	}, []);

	const onDateChange = async (d) => {
		setDate(d);
		const history = await localStorage.get(dataKey);
		const _history = Array.isArray(history) ? history : [];
		setRecord(_history);
	};

	const onConfirm = async () => {
		if (value.length === 0 || !date) { return; }

		const history = await localStorage.get(dataKey);
		const _history = Array.isArray(history) ? history : [];
		const data = {
			id: _history.length > 0 ? _history[_history.length - 1].id + 1 : 1,
			timestamp: date.timestamp,
			value: value,
			tag: tag.split(','),
		};
		const list = [..._history, data];
		await localStorage.set(dataKey, list);
		setRecord(list);
	};

	const onClear = async (id) => {
		const history = await localStorage.get(dataKey);
		await localStorage.set(dataKey, history.filter(x => x.id !== id));
		setRecord(record.filter(x => x.id !== id));
	};

	return (<SafeAreaView >
		<StatusBar />
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View>
				<Calendar
					onDayPress={onDateChange}
					markedDates={{
						[date.dateString]: {selected: true, disableTouchEvent: true, selectedDotColor: 'blue'},
					}}
				/>
				<TextInput
					onChangeText={setValue}
					value={value}
					inputMode="decimal"
					placeholder="price"
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
				<Text style={styles.message}>Message: {localStorage.message}</Text>
				<Text style={styles.header}>Date: {date.dateString.toString()}</Text>
				<ScrollView style={styles.record} nestedScrollEnabled={true}>
				{
					record.map(item => {
						return <View style={styles.listItem} key={item.id}>
							<Text>
								{item.id}:{'\n'}
								Value: {item.value}{'\n'}
								Tag: {item.tag.map(_tag => {
									return <Text key={_tag}>{_tag}, </Text>;
								})}
							</Text>
							<Pressable style={styles.clearButton}
								onPress={() => onClear(item.id)}
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
