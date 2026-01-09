import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageEnum } from '../../enum/PageEnum';
import useMask from '../../hook/useMask';
import useLanguage from './../../hook/useLanguage';

const BottomBar = ({
    currentPage, setPage,
}: {
    currentPage: string,
    setPage: (page: string) => void,
}) => {
    const language = useLanguage();
    const mask = useMask();

    const onPagePress = (page: string) => () => {
        if (currentPage !== page) { setPage(page); }
    };

    return <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.main)}><Text style={styles.text}>{language.get(`page.${PageEnum.main}`)}</Text></Pressable>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.search)}><Text style={styles.text}>{language.get(`page.${PageEnum.search}`)}</Text></Pressable>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.trend)}><Text style={styles.text}>{language.get(`page.${PageEnum.trend}`)}</Text></Pressable>
        <Pressable style={styles.bottomItem} onPress={onPagePress(PageEnum.setting)}><Text style={styles.text}>{language.get(`page.${PageEnum.setting}`)}</Text></Pressable>
        <Pressable style={styles.watchItem} onPress={() => { mask.toggle(); }}>
            <Text style={styles.text}>{mask.masked ? '🙈' : '👀'}</Text>
        </Pressable>
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
    watchItem: {
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: { textAlign: 'center' },
});

export default BottomBar;
