import { GroupType } from '../enum/InputEnum';

export interface IInputData {
    timestamp: number,
    name: string,
    value: string,
    group: keyof typeof GroupType | '',
    tag: string,
}

export interface IEditData extends IInputData {
    id: number;
    uniqueId: string;
}

export interface IInputDate {
    dateString: string,
    year: string,
    month: string,
    day: string,
    timestamp: number,
}

export interface IHistoryData {
    id: number,
    uniqueId: string,
    timestamp: number,
    name: string,
    value: number,
    group: keyof typeof GroupType | '',
    tag: string[],
}

export interface ISumByNameData {
    list: string[],
    sum: number,
}

export interface ISumByDayData {
    list: string[],
    sum: number,
}
