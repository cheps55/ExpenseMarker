import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageEnum } from '../../enum/PageEnum';
import useLanguage from './../../hook/useLanguage';

const BottomBar = ({
    currentPage, setPage,
}: {
    currentPage: string,
    setPage: (page: string) => void,
}) => {
    const language = useLanguage();

    const onPagePress = (page: string) => () => {
        if (currentPage !== page) { setPage(page); }
    };

    return <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.main)}><Text style={styles.text}>{language.get('page.main')}</Text></Pressable>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.search)}><Text style={styles.text}>{language.get('page.searchPage')}</Text></Pressable>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.setting)}><Text style={styles.text}>{language.get('page.setting')}</Text></Pressable>
    </View>;
};

const styles = StyleSheet.create({
    bottomBar: {
        height: 'auto',
        width: '100%',
        padding: 16,
        bottom: 0,
        flexDirection: 'row',
    },
    bottomItem: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    text: { textAlign: 'center' },
});

export default BottomBar;
