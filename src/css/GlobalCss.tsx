import { StyleSheet } from 'react-native';

const GlobalStyles: {[key:string]: StyleSheet.NamedStyles<any>} = {
    popUp: {
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
        title: { fontSize: 20, paddingBottom: 4 },
        buttonContainer: { flexDirection: 'row', gap: 4 },
    },
    dropdown: {
        group_food: {backgroundColor: 'lightgreen'},
        group_entertainment: {backgroundColor: 'lightblue'},
    },
};

export default GlobalStyles;
