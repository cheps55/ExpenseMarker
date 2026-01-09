import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'maskMoney';

type MaskContextType = {
    masked: boolean,
    toggle: () => void,
    setMasked: (value: boolean) => void,
}

const MaskContext = createContext<MaskContextType>({ masked: true, toggle: () => {}, setMasked: () => {} });

export const MaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [masked, setMaskedState] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const v = await AsyncStorage.getItem(STORAGE_KEY);
                if (v === null) {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(true));
                    setMaskedState(true);
                } else {
                    setMaskedState(JSON.parse(v));
                }
            } catch (e) {
                setMaskedState(true);
            }
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(masked)).catch(() => {});
    }, [masked]);

    const toggle = () => setMaskedState(prev => !prev);

    return <MaskContext.Provider value={{ masked, toggle, setMasked: setMaskedState }}>{children}</MaskContext.Provider>;
};

const useMask = () => useContext(MaskContext);

export default useMask;
