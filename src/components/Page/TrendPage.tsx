import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GroupType } from '../../enum/InputEnum';
import useLocalStorage from '../../hook/useLocalStorage';
import useMask from '../../hook/useMask';
import { IHistoryData, ISumData } from '../../interface/DataInterface';
import { maskedNumber } from '../../util/NumberUtil';
import YearDropdown from '../Input/YearDropdown';

const monthLabels = ['01','02','03','04','05','06','07','08','09','10','11','12'];

const TrendPage = () => {
    const localStorage = useLocalStorage();
    const mask = useMask();

    const currentYear = String(new Date().getFullYear());
    const [year, setYear] = useState<string>(currentYear);
    const [months, setMonths] = useState<number[]>(Array.from({length:12}, () => 0));
    const [groupedMonths, setGroupedMonths] = useState<Record<string, number>[]>(
        Array.from({length:12}, () => Object.keys(GroupType).reduce((acc: any, g) => ({...acc, [g]: 0}), {}))
    );
    const [showByGroup, setShowByGroup] = useState<boolean>(false);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    const load = async () => {
        const all = await localStorage.getRange();
        const byMonth = Array.from({length:12}, () => 0);
        const byMonthGroups = Array.from({length:12}, () => Object.keys(GroupType).reduce((acc: any, g) => ({...acc, [g]: 0}), {}));

        const keys = Object.keys(all).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
        for (const k of keys) {
            try {
                const summary = all[k] as ISumData;
                const kYear = k.substr(0,4);
                const kMonth = Number(k.substr(5,2));
                if (kYear === year && !isNaN(kMonth) && summary) {
                    // accumulate total
                    if (typeof summary.sum === 'number') { byMonth[kMonth - 1] += summary.sum; }

                    // if need per-item grouping, fetch items
                    if (summary.list?.length > 0) {
                        const items = await localStorage.getRange(summary.list) as {[key: string]: IHistoryData};
                        Object.keys(items).forEach(uid => {
                            const it = items[uid] as IHistoryData;
                            const g = it?.group ?? '';
                            const val = typeof it?.value === 'number' ? it.value : 0;
                            if (g && byMonthGroups[kMonth - 1][g] !== undefined) {
                                byMonthGroups[kMonth - 1][g] += val;
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }
        }

        setMonths(byMonth);
        setGroupedMonths(byMonthGroups);
    };

    const max = useMemo(() => Math.max(...months, 0), [months]);

    const onYearChange = (item: {value: string}) => {
        if (item && item.value) { setYear(String(item.value)); }
    };

    const legendColor = (i: number) => {
        const palette = ['#ff8a65','#64b5f6','#e57373','#81c784','#ba68c8','#ffd54f'];
        return palette[i % palette.length];
    };

    return <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.controlsTop}>
            <Text style={styles.toggleButton} onPress={() => setShowByGroup(prev => !prev)}>{showByGroup ? 'By Group: ON' : 'By Group: OFF'}</Text>
        </View>

        <View style={styles.controls}>
            <Text style={styles.yearLabel}>Year:</Text>
            <YearDropdown date={{year, month: '01', day: '01', dateString: '', timestamp: 0}} onChange={onYearChange} />
            <TextInput
                style={styles.yearInput}
                keyboardType="numeric"
                value={year}
                onChangeText={t => setYear(t)}
                onEndEditing={() => { if (year.length !== 4 || isNaN(Number(year))) { setYear(currentYear); } }}
            />
        </View>

        {showByGroup && <View style={styles.legend}>
            {Object.keys(GroupType).map((g, i) => (
                <View key={g} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: legendColor(i) }]} />
                    <Text>{g}</Text>
                </View>
            ))}
        </View>}

        <View style={styles.list}>
            {months.map((value, idx) => {
                if (!showByGroup) {
                    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
                    const widthPercent = `${percent}%`;
                    const showInside = percent >= 20;
                    return <View key={idx} style={styles.row}>
                        <Text style={styles.monthLabel}>{monthLabels[idx]}</Text>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { width: widthPercent, backgroundColor: `rgba(${(idx*40)%255}, ${150 + (idx*5)%100}, ${100 + (idx*10)%120}, 0.95)` }]}>
                                {showInside && value !== 0 && <Text style={styles.barText}>{maskedNumber(mask.masked, value)}</Text>}
                            </View>
                        </View>
                        {!showInside && <Text style={styles.valueLabel}>{value !== 0 ? maskedNumber(mask.masked, value) : ''}</Text>}
                    </View>;
                }

                // grouped view
                const groups = groupedMonths[idx];
                const monthTotal = Object.keys(groups).reduce((acc, k) => acc + (groups[k] || 0), 0);
                const percent = max > 0 ? Math.round((monthTotal / max) * 100) : 0;
                const widthPercent = `${percent}%`;
                return <View key={idx} style={styles.row}>
                    <Text style={styles.monthLabel}>{monthLabels[idx]}</Text>
                    <View style={styles.barContainer}>
                        <View style={[styles.barGroupWrapper, { width: widthPercent }]}>
                            {Object.keys(groups).map((g, gi) => {
                                const val = groups[g] || 0;
                                return <View key={g} style={{ flex: val, height: '100%', backgroundColor: legendColor(gi) }} />;
                            })}
                        </View>
                    </View>
                    <Text style={styles.valueLabel}>{monthTotal !== 0 ? maskedNumber(mask.masked, monthTotal) : ''}</Text>
                </View>;
            })}
        </View>

    </ScrollView>;
};

const styles = StyleSheet.create({
    container: { padding: 12 },
    controlsTop: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8 },
    toggleButton: { padding: 6, backgroundColor: '#f0f0f0', borderRadius: 6 },
    legend: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendColor: { width: 14, height: 14, marginRight: 6, borderRadius: 3 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    yearLabel: { marginRight: 8 },
    yearInput: { borderWidth: 1, borderColor: '#ccc', padding: 8, width: 80, textAlign: 'center' },
    barGroupWrapper: { height: '100%', flexDirection: 'row', overflow: 'hidden' },
    barText: { color: '#fff', textAlign: 'center', fontSize: 12 },
    list: { marginTop: 8 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    monthLabel: { width: 50 },
    barContainer: { flex: 1, height: 20, backgroundColor: '#eee', marginHorizontal: 8, borderRadius: 4, overflow: 'hidden' },
    bar: { height: '100%', backgroundColor: '#4caf50' },
    valueLabel: { width: 80, textAlign: 'right' },
});

export default TrendPage;
