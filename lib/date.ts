/**
 * AeroSky Mobile Date Formatting Utilities
 * Standard Project Format: DD/MM/YYYY
 */

export function formatDate(
    date: string | number | Date | null | undefined,
    separator: string = '/'
): string {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}${separator}${month}${separator}${year}`;
    } catch {
        return '';
    }
}

export function formatDateTime(
    date: string | number | Date | null | undefined,
    separator: string = '/'
): string {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const datePart = formatDate(d, separator);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${datePart} ${hours}:${minutes}`;
    } catch {
        return '';
    }
}
