import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import BottomBar from './components/BottomBar/BottomBar';
import ChartPage from './components/Page/ChartPage';
import MainPage from './components/Page/MainPage';
import { PageEnum } from './enum/PageEnum';
import useAuth from './hook/useAuth';

function App() {
	useAuth();

	const [page, setPage] = useState<string>(PageEnum.main);

	return <SafeAreaView style={styles.container}>
		<StatusBar />
		{(() => {
			switch(page) {
				case PageEnum.chart: return <ChartPage />;
				default: return <MainPage />;
			}
		})()}
		<BottomBar currentPage={page} setPage={setPage} />
	</SafeAreaView>;
}

const styles = StyleSheet.create({
	container: {height: '100%', flex: 1},
});

export default App;
