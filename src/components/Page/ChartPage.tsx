import { useNetInfoInstance } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import GlobalStyles from '../../css/GlobalCss';
import useFirebase from '../../hook/useFirebase';
import useLanguage from '../../hook/useLanguage';
import useLocalStorage from '../../hook/useLocalStorage';

function ChartPage() {
	const localStorage = useLocalStorage();
	const cloudStorage = useFirebase();
	const language = useLanguage();

	const { netInfo: { isConnected } } = useNetInfoInstance();

	const [sum, setSum] = useState<{[key: string]: number}>({});

	useEffect(() => {

	}, []);

	return <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
            <Text>CHART</Text>
        </View>

    </ScrollView>;
}

const styles = StyleSheet.create({
	dayContainer: { width: '100%' },
	day: {textAlign: 'center'},
	selectedDay: {color: 'purple', backgroundColor: 'lightblue'},
	header: {textAlign: 'center'},
	message: {color:'red'},
	record: {height: '100%', overflow: 'hidden'},
	listItem: { padding: 4 },
	redText: {color: 'red', textAlign: 'center'},
	clearYext: {color: 'red'},
	group_food: GlobalStyles.dropdown.group_food,
	group_entertainment: GlobalStyles.dropdown.group_entertainment,
});

export default ChartPage;
