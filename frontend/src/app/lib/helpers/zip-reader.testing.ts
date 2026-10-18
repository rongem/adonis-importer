// Test helper: reads ZIP archives with stored (uncompressed) entries via the central directory.
import { crc32 } from './zip.functions';

export interface ReadZipEntry {
    path: string;
    data: Uint8Array;
    crcValid: boolean;
    utf8Flag: boolean;
}

export function readZip(zip: Uint8Array) {
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    const decoder = new TextDecoder();
    const endOffset = zip.length - 22;
    if (view.getUint32(endOffset, true) !== 0x06054B50) throw new Error('End of central directory not found');
    const entryCount = view.getUint16(endOffset + 10, true);
    let position = view.getUint32(endOffset + 16, true);

    const entries = new Map<string, ReadZipEntry>();
    for (let i = 0; i < entryCount; i++) {
        if (view.getUint32(position, true) !== 0x02014B50) throw new Error('Invalid central directory header');
        const flags = view.getUint16(position + 8, true);
        if (view.getUint16(position + 10, true) !== 0) throw new Error('Only stored entries are supported');
        const crc = view.getUint32(position + 16, true);
        const size = view.getUint32(position + 24, true);
        const nameLength = view.getUint16(position + 28, true);
        const localOffset = view.getUint32(position + 42, true);
        const path = decoder.decode(zip.subarray(position + 46, position + 46 + nameLength));

        if (view.getUint32(localOffset, true) !== 0x04034B50) throw new Error('Invalid local header for ' + path);
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const dataStart = localOffset + 30 + localNameLength + localExtraLength;
        const data = zip.subarray(dataStart, dataStart + size);

        entries.set(path, { path, data, crcValid: crc32(data) === crc, utf8Flag: (flags & 0x0800) !== 0 });
        position += 46 + nameLength;
    }
    return entries;
}

export function readZipText(zip: Uint8Array, path: string) {
    const entry = readZip(zip).get(path);
    if (!entry) throw new Error('Missing entry ' + path);
    return new TextDecoder().decode(entry.data);
}
