import { GroupType } from '../enum/InputType';

export interface IInputData {
    id: number,
    timestamp: number,
    name: string,
    value: string,
    group: keyof typeof GroupType,
    tag: string,
}

export interface ISavedData extends Omit<IInputData, 'value' | 'tag'> {
    value: number,
    tag: string[],
}
