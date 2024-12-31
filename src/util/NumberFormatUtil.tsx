export const formatNumber = (number: string | number, delimiter: string = ',') => {
    if (!number) { return ''; }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};
