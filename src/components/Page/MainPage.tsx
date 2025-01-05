import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import GlobalStyles from '../../css/GlobalCss';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { IInputData, IInputDate, ISavedList } from '../../interface/DataInterface';
import { getDayInMonth } from '../../util/DateTimeUtil';
import { addNumber, formatNumber, subtractNumber } from '../../util/NumberUtil';
import InputForm from '../Form/InputForm';
import ConfirmPopUp from '../PopUp/ConfirmPopUp';
import EditPopUp from '../PopUp/EditPopUp';

function MainPage() {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

	const [sum, setSum] = useState<{[key: string]: number}>({});
	const [record, setRecord] = useState<{[key: string]: ISavedList}>({});
	const initialInputData: IInputData = { id: 0, timestamp: 0, name: '', value: '', group: '', tag: '' };
	const [inputData, setInputData] = useState<IInputData>(initialInputData);
	const [date, setDate] = useState<IInputDate>({ dateString: '', year: '', month: '', day: '', timestamp: 0 });
	const { dateString, year, month, day } = date;
	const key = `${year}-${month}-${day}`;

	const [syncType, setSyncType] = useState('');
	const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
	const [selectedEdit, setSelectedEdit] = useState<IInputData | {}>({});
	const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);

	useEffect(() => {
		const current = new Date();
		const _year = String(current.getFullYear());
		const _month = String(current.getMonth() + 1).padStart(2, '0');
		const _day = String(new Date().getDate()).padStart(2, '0');
		initRecordList(_year, _month, _day);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const initRecordList = async (_year: string, _month: string, _day: string) => {
		let keys = [];
		for (const d of getDayInMonth(Number(_year), Number(_month))) { keys.push(`${_year}-${_month}-${d}`); }
		const result = await localStorage.getRange(keys);
		if (result) {
			for (const _key of Object.keys(result)) {
				setRecord(prev => {
					prev[_key] = result[_key];
					return {...prev};
				});
			}
			setDate({dateString: `${_year}-${_month}-${_day}`, timestamp: new Date(`${_year}-${_month}-${_day}`).valueOf(), year: _year, month: _month, day: _day});
		}
	};

	const onSync = async () => {
		if (syncType === 'from') {
			const cloud = await cloudStorage.getRange();
			if (cloud) {
				for (const _key of Object.keys(cloud)) {
					await localStorage.set(_key, cloud[_key]);
				}
			}
		}

		if (syncType === 'to') {
			const local = await localStorage.getRange();
			if (local) {
				for (const _key of Object.keys(local)) {
					await cloudStorage.set(_key, local[_key]);
				}
			}
		}
		setIsConfirmPopUpOpen(false);
	};

	const isDisableConfirmButton = () => {
		const { name, value } = inputData;
		const _value = Number(value);
		return (
			name.length === 0 || value.length === 0 || !date ||
			typeof _value !== 'number' || isNaN(_value) || _value < 0
		);
	};

	const onConfirm = async (addData: IInputData) => {
		const history = await localStorage.get(key);
		const { list, daySum, daySumDetail } = history;
		const _value = Number(addData.value);
		const _list: ISavedList = {
			list: [...list, {
				id: list.length > 0 ? list[list.length - 1].id + 1 : 1,
				timestamp: addData.timestamp,
				name: addData.name,
				value: _value,
				group: addData.group,
				tag: addData.tag.length > 0 ? addData.tag.split(',') : [],
			}],
			daySum: addNumber([daySum,_value]),
			daySumDetail: { ...daySumDetail, [addData.group]: addNumber([daySumDetail[addData.group], _value]) },
		};
		await localStorage.set(key, _list);
		setRecord(prev => {
			prev[key] = _list;
			return {...prev};
		});
		setInputData(initialInputData);
	};

	const onEdit = async (editData: IInputData) => {
		const history = await localStorage.get(key);
		let oldData = history.list.find(x => x.id === editData.id)!;

		const oldValue = oldData.value;
		const _value = Number(editData.value);
		oldData.name = editData.name;
		oldData.value = _value;
		oldData.group = editData.group;
		oldData.tag = editData.tag.length > 0 ? editData.tag.split(',') : [];

		history.daySum = subtractNumber([history.daySum, oldValue]);
		history.daySum = addNumber([history.daySum, _value]);
		history.daySumDetail[editData.group] = subtractNumber([history.daySumDetail[editData.group], oldValue]);
		history.daySumDetail[editData.group] = addNumber([history.daySumDetail[editData.group], _value]);
		await localStorage.set(key, history);
		setRecord(prev => {
			prev[key] = history;
			return {...prev};
		});
		setIsEditPopUpOpen(false);
		setSelectedEdit({});
	};

	const onClear = async (editData: IInputData) => {
		const history = await localStorage.get(key);
		const { list, daySum, daySumDetail } = history;
		const _value = Number(editData.value);
		const data = {
			list: list.filter(x => x.id !== editData.id),
			daySum: subtractNumber([daySum, _value]),
			daySumDetail: { ...daySumDetail, [editData.group]: subtractNumber([daySumDetail[editData.group], _value]) },
		};
		await localStorage.set(dateString, data);
		setRecord(prev => {
			prev[dateString] = data;
			return {...prev};
		});
		setIsEditPopUpOpen(false);
		setSelectedEdit({});
	};

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
            <View>
                <Button
                    title={`${language.get('sync.from')}${isConnected ? '' : ` ${language.get('no_internet')}`}`}
                    onPress={() => { setSyncType('from'); setIsConfirmPopUpOpen(true); }}
                    disabled={!isConnected}
                />
                <Button
                    title={`${language.get('sync.to')}${isConnected ? '' : ` ${language.get('no_internet')}`}`}
                    color="green"
                    onPress={() => { setSyncType('to'); setIsConfirmPopUpOpen(true); }}
                    disabled={!isConnected}
                />
            </View>
            <Calendar
                onDayPress={(item: IInputDate) => {
                    setDate({
                        dateString: item.dateString,
                        year: String(item.year),
                        month: String(item.month).padStart(2, '0'),
                        day: String(item.day).padStart(2, '0'),
                        timestamp: item.timestamp,
                    });
                }}
                onMonthChange={(item: IInputDate) => {
                    setRecord({});
                    setSum({});
                    const _year = String(item.year);
                    const _month = String(item.month).padStart(2, '0');
                    const _day = String(item.day).padStart(2, '0');
                    initRecordList(_year, _month, _day);
                }}
                // eslint-disable-next-line react/no-unstable-nested-components
                dayComponent={(props: any) => {
                    const { date: _date, onPress, children } = props;
                    const _key = `${_date.year}-${String(_date.month).padStart(2, '0')}-${String(_date.day).padStart(2, '0')}`;
                    return (
                        <TouchableOpacity
                            style={[styles.dayContainer, dateString === _date.dateString ? styles.selectedDay : '']}
                            onPress={() => { requestAnimationFrame(() => onPress(_date)); }}
                        >
                            <Text style={styles.day}>{children}</Text>
                            <Text style={styles.redText}>{formatNumber(record?.[_key]?.daySum)}</Text>
                        </TouchableOpacity>
                    );
                }}
                hideExtraDays
            />
            <InputForm state={inputData} setState={setInputData} />
            <Button
                title={language.get('confirm')}
                onPress={() => onConfirm(inputData)}
                disabled={isDisableConfirmButton()}
            />
            <Text style={styles.header}>
                {language.get('date')}: {dateString.toString()}&nbsp;
                {language.get('sum')}: {formatNumber(record?.[key]?.daySum)}
            </Text>
            <ScrollView style={styles.record} nestedScrollEnabled={true}>
            {
                record?.[key]?.list?.map(item => {
                    return <View style={[styles.listItem, styles[`group_${item.group}`]]} key={item.id}>
                        <Pressable
							onPress={() => {
								setSelectedEdit({...item, value: String(item.value), tag: item.tag.join(',')});
								setIsEditPopUpOpen(true);}
							}
						>
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
            data={selectedEdit as IInputData}
            onConfirm={onEdit} onClose={() => {setSelectedEdit({}); setIsEditPopUpOpen(false);}}
            onClear={onClear}
        />}
    </ScrollView>;
}

const styles = StyleSheet.create({
	dayContainer: { width: '100%' },
	day: {textAlign: 'center'},
	selectedDay: {color: 'purple', backgroundColor: 'lightblue'},
	header: {textAlign: 'center'},
	message: {color:'red'},
	record: {height: 200, overflow: 'hidden'},
	listItem: { padding: 4 },
	redText: {color: 'red', textAlign: 'center'},
	clearYext: {color: 'red'},
	group_: {},
	group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
});

export default MainPage;
