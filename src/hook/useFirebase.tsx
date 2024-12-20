import firestore from '@react-native-firebase/firestore';

const useFirebase = () => {
    const collection = 'Record';
    
    const getCloudData = async (list: string[]) => {
        const result = await firestore().collection(collection).get();
        return result;
    };

    const setCloudData = async () => {
        firestore()
        .collection(collection)
        .add({
            name: 'Ada Lovelace',
            age: 30,
        })
        .then(() => {
            console.log('Record added!');
        });
    };

    return {
        getCloudData,
        setCloudData,
    };
};

export default useFirebase;
