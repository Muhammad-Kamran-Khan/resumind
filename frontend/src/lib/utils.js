import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge classnames with tailwind-merge */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/** Format bytes into human readable string */
export function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/** Generate UUID (browser) */
export const generateUUID = () => crypto.randomUUID();