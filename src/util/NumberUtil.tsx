export const formatNumber = (number: string | number, delimiter: string = ',') => {
    if (!number) { return ''; }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};

export const addNumber = (arr: number[]) => {
    return arr.reduce((acc, item) => acc + (!isNaN(item) ? item : 0), 0);
};

export const subtractNumber = (arr: number[]) => {
    if (arr.length === 0) { return 0; }
    return arr.slice(1).reduce((acc, item) => acc - (!isNaN(item) ? item : 0), arr[0]);
};

export const maskedNumber = (masked: boolean, value: string | number | undefined) => {
    if (typeof value === 'undefined') { return ''; }
    if (masked) { return '***'; }
    return formatNumber(value ?? '');
};
