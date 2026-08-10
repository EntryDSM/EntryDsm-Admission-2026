const BYTES_PER_MEGABYTE = 1024 * 1024;

export const bytesToMegabytes = (bytes: number) => Number((bytes / BYTES_PER_MEGABYTE).toFixed(2));
