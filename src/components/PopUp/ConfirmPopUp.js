import React from "react";
import { Button, Modal, StyleSheet, Text, View } from "react-native";
import useLanguage from '../../hook/useLanguage';

const ConfirmPopUp = ({
    onConfirm, onClose,
}) => {
    const language = useLanguage();

    return <>
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text>{language.get('confirm.sync')}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title={language.get('close')} color="red" onPress={onClose} />
                        <Button title={language.get('confirm')} onPress={onConfirm} />
                    </View>
                </View>
            </View>
        </Modal>
    </>;
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
});
export default ConfirmPopUp;
