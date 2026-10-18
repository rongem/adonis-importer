import { describe, expect, it } from 'vitest';

import { crc32, createZip } from './zip.functions';
import { readZip } from './zip-reader.testing';

describe('zip functions', () => {
  it('computes the standard CRC-32 check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xCBF43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('creates an archive whose entries can be read back', () => {
    const binary = new Uint8Array([0, 1, 2, 255]);
    const zip = createZip([
      { path: 'a.txt', content: 'Hallo' },
      { path: 'ordner/Übersicht.xml', content: '<x>ä€</x>' },
      { path: 'bin', content: binary },
    ]);

    const entries = readZip(zip);
    expect([...entries.keys()]).toEqual(['a.txt', 'ordner/Übersicht.xml', 'bin']);
    expect(new TextDecoder().decode(entries.get('a.txt')!.data)).toBe('Hallo');
    expect(new TextDecoder().decode(entries.get('ordner/Übersicht.xml')!.data)).toBe('<x>ä€</x>');
    expect([...entries.get('bin')!.data]).toEqual([0, 1, 2, 255]);
    expect([...entries.values()].every(entry => entry.crcValid && entry.utf8Flag)).toBe(true);
  });

  it('creates a valid empty archive', () => {
    const zip = createZip([]);
    expect(zip.length).toBe(22);
    expect(readZip(zip).size).toBe(0);
  });

  it('is deterministic', () => {
    const entries = [{ path: 'a.txt', content: 'x' }];
    expect(createZip(entries)).toEqual(createZip(entries));
  });
});
