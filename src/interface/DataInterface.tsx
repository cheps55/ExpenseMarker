import { GroupType } from '../enum/InputEnum';

export interface IInputData {
    id: number,
    timestamp: number,
    name: string,
    value: string,
    group: keyof typeof GroupType | '',
    tag: string,
}

export interface ISavedData extends Omit<IInputData, 'value' | 'tag'> {
    value: number,
    tag: string[],
}

export interface ISavedList {
    list: ISavedData[],
    daySum: number,
    daySumDetail: { [key: string]: number },
}

export interface IInputDate {
    dateString: string,
    year: string,
    month: string,
    day: string,
    timestamp: number,
}

export interface IStorage {
    set: (key: string, payload: ISavedList) => Promise<void>;
    get: (key: string) => Promise<ISavedList>;
    getRange: (keys?: string[]) => Promise<{ [key: string]: ISavedList }>;
    message: string;
    clear?: () => Promise<void>;
    logAllRecord?: () => Promise<void>;
}
