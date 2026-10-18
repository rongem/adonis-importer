// Minimal ZIP writer (stored entries, no compression). Sufficient for small generated files like XLSX templates.

export interface ZipEntry {
    path: string;
    content: string | Uint8Array;
}

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

export function crc32(data: Uint8Array) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// fixed timestamp 1980-01-01 00:00 (DOS format) keeps the output deterministic
const dosTime = 0;
const dosDate = (1 << 5) | 1;
// general purpose flag bit 11: file names are UTF-8 encoded
const utf8Flag = 0x0800;

export function createZip(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
    const encoder = new TextEncoder();
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    for (const entry of entries) {
        const name = encoder.encode(entry.path);
        const data = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
        const crc = crc32(data);

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034B50, true);
        local.setUint16(4, 20, true);
        local.setUint16(6, utf8Flag, true);
        local.setUint16(8, 0, true);
        local.setUint16(10, dosTime, true);
        local.setUint16(12, dosDate, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);
        local.setUint16(28, 0, true);
        localParts.push(new Uint8Array(local.buffer), name, data);

        const central = new DataView(new ArrayBuffer(46));
        central.setUint32(0, 0x02014B50, true);
        central.setUint16(4, 20, true);
        central.setUint16(6, 20, true);
        central.setUint16(8, utf8Flag, true);
        central.setUint16(10, 0, true);
        central.setUint16(12, dosTime, true);
        central.setUint16(14, dosDate, true);
        central.setUint32(16, crc, true);
        central.setUint32(20, data.length, true);
        central.setUint32(24, data.length, true);
        central.setUint16(28, name.length, true);
        central.setUint32(42, offset, true);
        centralParts.push(new Uint8Array(central.buffer), name);

        offset += 30 + name.length + data.length;
    }

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054B50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    return concat([...localParts, ...centralParts, new Uint8Array(end.buffer)]);
}

function concat(parts: Uint8Array[]) {
    const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let position = 0;
    for (const part of parts) {
        result.set(part, position);
        position += part.length;
    }
    return result;
}
