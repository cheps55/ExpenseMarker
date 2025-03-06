import React, { useEffect, useMemo, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import GlobalStyles from '../../css/GlobalCss';
import { LocalStorageKey } from '../../enum/CollectionEnum';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';
import { IEditData, IHistoryData, IInputData, IInputDate, ISumByDayData, ISumByNameData } from '../../interface/DataInterface';
import { getDayInMonth } from '../../util/DateTimeUtil';
import { addNumber, formatNumber, subtractNumber } from '../../util/NumberUtil';
import InputForm from '../Form/InputForm';
import EditPopUp from '../PopUp/EditPopUp';

const MainPage = () => {
	const localStorage = useLocalStorage();
	const language = useLanguage();

	const [listByDay, setListByDay] = useState<{[key: string]: ISumByDayData}>({});
	const [historyList, setHistoryList] = useState<{[key: string]: IHistoryData}>({});
	const initialInputData: IInputData = { timestamp: 0, name: '', value: '', group: '', tag: '' };
	const [inputData, setInputData] = useState<IInputData>(initialInputData);
	const [date, setDate] = useState<IInputDate>({ dateString: '', year: '', month: '', day: '', timestamp: 0 });
	const { dateString, year, month, day } = date;
	const key = `${year}-${month}-${day}`;

	const [hasUpdate, setHasUpdate] = useState(false);
	const [selectedEdit, setSelectedEdit] = useState<IEditData | {}>({});
	const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
	const [nameList, setNameLust] = useState<string[]>([]);

	const monthSum = useMemo(() => {
		let sum = 0;
		sum = addNumber([sum, ...Object.keys(listByDay).map(_key => listByDay[_key].sum)]);
		return sum;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [month, hasUpdate]);

	useEffect(() => {
		const current = new Date();
		const _year = String(current.getFullYear());
		const _month = String(current.getMonth() + 1).padStart(2, '0');
		const _day = String(new Date().getDate()).padStart(2, '0');
		initRecordList(_year, _month, _day);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const initRecordList = async (_year: string, _month: string, _day: string) => {
		setNameLust(await localStorage.getAllNameKeys());
		let keys: string[] = [];
		for (const d of getDayInMonth(Number(_year), Number(_month))) { keys.push(`${_year}-${_month}-${d}`); }
		const byDay = await localStorage.getRange(keys);
		if (byDay) {
			for (const _key of Object.keys(byDay)) {
				const _summary = byDay[_key] as ISumByDayData;
				if (_summary.list?.length > 0) {
					const today = await localStorage.getRange(_summary.list);
					for (const timestampKey of Object.keys(today)) {
						setHistoryList(prev => {
							prev[timestampKey] = today[timestampKey] as IHistoryData;
							return {...prev};
						});
					}
				}
				setListByDay(prev => {
					prev[_key] = _summary;
					return {...prev};
				});
			}
			setDate({dateString: `${_year}-${_month}-${_day}`, timestamp: new Date(`${_year}-${_month}-${_day}`).valueOf(), year: _year, month: _month, day: _day});
		}
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
		const byDay = (await localStorage.get(key)) as ISumByDayData;
		const byName = (await localStorage.get(addData.name)) as ISumByNameData;

		const value = Number(addData.value)
		const id = byDay.list.length > 0 ? byDay.list.length : 1;
		const item = {
			id: id,
			uniqueId: String(addData.timestamp + id),
			timestamp: addData.timestamp,
			name: addData.name,
			value: value,
			group: addData.group,
			tag: addData.tag.length > 0 ? addData.tag.split(',') : [],
		};

		const newDay = { list: [...byDay.list, item.uniqueId], sum: addNumber([byDay.sum, value]) };
		await localStorage.set(key, newDay);
		await localStorage.set(item.name, {list: [...(byName.list), item.uniqueId], sum: addNumber([byName.sum, value])});
		await localStorage.set(item.uniqueId, item);

		setHistoryList(prev => {
			prev[item.uniqueId] = item;
			return prev;
		});

		setListByDay(prev => {
			prev[key] = newDay;
			return prev;
		});

		setInputData(initialInputData);
		setHasUpdate(prev => !prev);
	};

	const onEdit = async (editData: IEditData) => {
		const oldData = historyList[editData.uniqueId];
		const newData = {
			...editData,
			value: Number(editData.value),
			tag: editData.tag.length > 0 ? editData.tag.split(',') : [],
		};

		let byNameOld = (await localStorage.get(oldData.name)) as ISumByNameData;
		let byNameNew = (await localStorage.get(editData.name)) as ISumByNameData;
		if (oldData.name !== editData.name) {
			byNameOld.list = byNameOld.list.filter(x => x !== oldData.uniqueId);
			byNameOld.sum = subtractNumber([byNameOld.sum, oldData.value]);

			byNameNew.list = [...byNameNew.list, editData.uniqueId];
			byNameNew.sum = addNumber([byNameNew.sum, Number(editData.value)]);

			if (byNameOld.list?.length <= 1) {await localStorage.remove(oldData.name);}
			if (byNameOld.list?.length > 1) { await localStorage.set(oldData.name, byNameOld); }
			await localStorage.set(editData.name, byNameNew);
		} else {
			byNameOld.sum = subtractNumber([byNameOld.sum, oldData.value]);
			byNameOld.sum = addNumber([byNameOld.sum, Number(editData.value)]);
			await localStorage.set(oldData.name, byNameOld);
		}

		let byDay = (await localStorage.get(key)) as ISumByDayData;
		byDay.sum = subtractNumber([byDay.sum, oldData.value]);
		byDay.sum = addNumber([byDay.sum, Number(editData.value)]);
		await localStorage.set(key, byDay);

		await localStorage.set(editData.uniqueId, newData);

		setHistoryList(prev => {
			prev[editData.uniqueId] = newData;
			return prev;
		});

		setListByDay(prev => {
			prev[key] = byDay;
			return prev;
		});

		setIsEditPopUpOpen(false);
		setSelectedEdit({});
		setHasUpdate(prev => !prev);
	};

	const onClear = async (editData: IEditData) => {
		let byName = (await localStorage.get(editData.name)) as ISumByNameData;
		byName.list = byName.list.filter(x => x !== editData.uniqueId);
		byName.sum = subtractNumber([byName.sum, Number(editData.value)]);
		if (byName.list.length <= 1) {
			await localStorage.remove(editData.name);
		} else {
			await localStorage.set(editData.name, byName);
		}

		let byDay = (await localStorage.get(key)) as ISumByDayData;
		byDay.list = byDay.list.filter(x => x !== editData.uniqueId);
		byDay.sum = subtractNumber([byDay.sum, Number(editData.value)]);
		if (byDay.list.length <= 1) {
			await localStorage.remove(key);
		} else {
			await localStorage.set(key, byDay);
		}

		await localStorage.remove(editData.uniqueId);

		const deletedList = (await localStorage.get(LocalStorageKey.deleteRecord)) as ISumByDayData;
		let _deleteList = [...deletedList.list, editData.uniqueId];
		if (byName.list.length <= 1) { _deleteList = [..._deleteList, editData.name]; }
		if (byDay.list.length <= 1) { _deleteList = [..._deleteList, key]; }
		await localStorage.set(LocalStorageKey.deleteRecord, {list: _deleteList, sum: -1});

		setHistoryList(prev => {
			delete prev[editData.uniqueId];
			return prev;
		});

		setListByDay(prev => {
			prev[key] = byDay;
			return prev;
		});

		setIsEditPopUpOpen(false);
		setSelectedEdit({});
		setHasUpdate(prev => !prev);
	};

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
            <Calendar
                onDayPress={(item: IInputDate) => {
					const dateData = {
                        dateString: item.dateString,
                        year: String(item.year),
                        month: String(item.month).padStart(2, '0'),
                        day: String(item.day).padStart(2, '0'),
                        timestamp: item.timestamp,
                    };
                    setDate(dateData);
                }}
                onMonthChange={(item: IInputDate) => {
                    setListByDay({});
                    const _year = String(item.year);
                    const _month = String(item.month).padStart(2, '0');
                    const _day = String(item.day).padStart(2, '0');
                    initRecordList(_year, _month, _day);
                }}
				renderHeader={(header: string) => {
					return <View>
						<Text>{new Date(header).toLocaleDateString('en-GB', {year: 'numeric', month: 'long'})}</Text>
						<Text style={styles.redText}>{monthSum}</Text>
					</View>;
				}}
                // eslint-disable-next-line react/no-unstable-nested-components
                dayComponent={(props: any) => {
                    const { date: _date, onPress, children } = props;
                    const _key = `${_date.year}-${String(_date.month).padStart(2, '0')}-${String(_date.day).padStart(2, '0')}`;
                    return <TouchableOpacity
						style={[styles.dayContainer, dateString === _date.dateString ? styles.selectedDay : '']}
						onPress={() => { requestAnimationFrame(() => onPress(_date)); }}
					>
						<Text style={styles.day}>{children}</Text>
						<Text style={styles.redText}>{formatNumber(listByDay?.[_key]?.sum)}</Text>
					</TouchableOpacity>;
                }}
                hideExtraDays
				enableSwipeMonths
            />
            <InputForm state={inputData} setState={setInputData} suggestionList={nameList} />
            <Button
                title={language.get('confirm')}
                onPress={() => onConfirm({...inputData, ...date})}
                disabled={isDisableConfirmButton()}
            />
            <Text style={styles.header}>
                {language.get('date')}: {dateString.toString()}&nbsp;
                {language.get('sum')}: {formatNumber(listByDay?.[key]?.sum)}
            </Text>
            <ScrollView style={styles.listByDay} nestedScrollEnabled={true}>
            {
                listByDay?.[key]?.list?.map(_key => {
					const item = historyList[_key] ?? {};
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
        {isEditPopUpOpen && <EditPopUp
            data={selectedEdit as IEditData}
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
	listByDay: {height: 200, overflow: 'hidden'},
	listItem: { padding: 4 },
	redText: {color: 'red', textAlign: 'center'},
	clearYext: {color: 'red'},
	group_: {},
	group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
});

export default MainPage;
