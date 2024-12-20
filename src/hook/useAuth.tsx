import auth from '@react-native-firebase/auth';
import { useEffect } from 'react';
import { Authentication } from '../authentication/authentication';

const useAuth = () => {

    useEffect(() => {
        auth()
        .signInWithEmailAndPassword(Authentication.email, Authentication.password)
        .then(() => {
            console.log('User account created & signed in!');
        })
        .catch(error => {
            console.error(error);
        });
    }, []);

    return {};
};

export default useAuth;
