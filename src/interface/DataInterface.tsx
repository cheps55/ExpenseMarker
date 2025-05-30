import { GroupType } from '../enum/InputEnum';
import { Action } from './../enum/ActionEnum';

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
    updated: number,
}

export interface ISumData {
    list: string[],
    sum: number,
    updated: number;
}

export interface IActionLog {
    list: IActionItem[];
}

export interface ILastSync {
    from: number;
    to: number;
}

export interface IActionItem {
    uniqueId: string;
    action: keyof typeof Action;
    updated: number;
}
