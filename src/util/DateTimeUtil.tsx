export const getDayInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 0);
    return Array.from({ length: date.getDate() }, (_, i) => String(i + 1).padStart(2, '0'));
};

export const getFormatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};
