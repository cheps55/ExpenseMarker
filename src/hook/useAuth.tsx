import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { useEffect } from 'react';
import { Authentication } from '../authentication/authentication';

const useAuth = () => {

    useEffect(() => {
        signInWithEmailAndPassword(getAuth(), Authentication.email, Authentication.password)
        .then(() => {
            console.log('User account signed in!');
        })
        .catch(error => {
            console.error(error);
        });
    }, []);

    return {};
};

export default useAuth;
