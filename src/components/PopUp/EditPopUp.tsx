import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';
import GlobalStyles from '../../css/GlobalCss';
import useLanguage from '../../hook/useLanguage';
import { IInputData } from '../../interface/InputInterface';
import InputForm from '../Form/InputForm';

const EditPopUp = ({
    data, onConfirm, onClose, onClear,
}: {
    data: IInputData,
    onConfirm: (args: IInputData) => void,
    onClose: () => void,
    onClear: (args: IInputData) => void,
}) => {
    const language = useLanguage();

    const [state, setState] = useState<IInputData>({...data});

    return <>
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>{language.get('pop_up.edit')}</Text>
                    <View>
                        <InputForm state={state} setState={setState} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title={language.get('close')} color="red" onPress={onClose} />
                        <Button title={language.get('clear')} color="darkred" onPress={() => onClear(state)} />
                        <Button title={language.get('confirm')} onPress={() => onConfirm(state)} />
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
    buttonContainer: GlobalStyles.popUp.buttonContainer,
});
export default EditPopUp;
