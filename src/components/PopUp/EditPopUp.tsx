import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlobalStyles from '../../css/GlobalCss';
import useLanguage from '../../hook/useLanguage';
import { IEditData } from '../../interface/DataInterface';
import InputForm from '../Form/InputForm';

const EditPopUp = ({
    data, onEdit, onBatchEdit, onClose, onClear,
}: {
    data: IEditData,
    onEdit: (args: IEditData) => void,
    onBatchEdit: (args: IEditData) => void,
    onClose: () => void,
    onClear: (args: IEditData) => void,
}) => {
    const language = useLanguage();

    const [state, setState] = useState<IEditData>({...data});

    return <>
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.close} onPress={onClose}><Text>X</Text></TouchableOpacity>
                    <Text style={styles.title}>{language.get('pop_up.edit')}</Text>
                    <View style={styles.form}>
                        <InputForm state={state} setState={setState} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title={language.get('clear')} color="red" onPress={() => onClear(state)} />
                        <Button title={language.get('confirm')} onPress={() => onEdit(state)} />
                    </View>
                    <View style={styles.buttonContainer2}>
                        <Button title={language.get('batch_change_name_group')} color="green" onPress={() => onBatchEdit(state)} />
                    </View>
                </View>
            </View>
        </Modal>
    </>;
};

const styles = StyleSheet.create({
    centeredView: GlobalStyles.popUp.centeredView,
    modalView: GlobalStyles.popUp.modalView,
    title: GlobalStyles.popUp.title,
    form: { width: 150 },
    buttonContainer: GlobalStyles.popUp.buttonContainer,
    buttonContainer2: {
        ...GlobalStyles.popUp.buttonContainer,
        paddingTop: 4,
    },
    close: {
        position: 'absolute',
        right: 0,
        padding: 12,
        backgroundColor: 'lightgray',
    },
});
export default EditPopUp;
