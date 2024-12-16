export const formatNumber = (number: string, decimal: number = 2, delimiter: string = ',') => {
    if (!number) { return ''; }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};
