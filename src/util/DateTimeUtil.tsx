export const getDayInMonth = (year: number, month: number) => {
    const date = new Date(year, month + 1, 0);
    return Array.from({ length: date.getDate() }, (_, i) => String(i + 1).padStart(2, '0'));
}