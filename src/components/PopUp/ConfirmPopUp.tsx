import React from "react";
import { Button, Modal, StyleSheet, Text, View } from "react-native";
import GlobalStyles from "../../css/GlobalCss";
import useLanguage from '../../hook/useLanguage';

const ConfirmPopUp = ({
    title, onConfirm, onClose,
}: {
    title: string,
    onConfirm: () => void,
    onClose: () => void,
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
                    <Text style={styles.title}>{title}</Text>
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
    centeredView: GlobalStyles.popUp.centeredView,
    modalView: GlobalStyles.popUp.modalView,
    title: GlobalStyles.popUp.title,
    buttonContainer: GlobalStyles.popUp.buttonContainer,
});
export default ConfirmPopUp;
