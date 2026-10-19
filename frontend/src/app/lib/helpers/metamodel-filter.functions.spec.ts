import { describe, expect, it } from 'vitest';

import { AdonisBasicClass } from '../models/adonis-rest/metadata/basic-class.interface';
import { AdonisNoteBook } from '../models/adonis-rest/metadata/notebook.interface';
import { filterNotebook, isImportableClass } from './metamodel-filter.functions';

const adonisClass = (metaName: string, abstract = false, repositoryClass = true) =>
  ({ id: metaName, metaName, abstract, repositoryClass }) as AdonisBasicClass;

const property = (id: string, ctrlType: string, readonly = false) =>
  ({ id, type: ctrlType === 'RELATIONS' ? 'RELATIONS' : 'ATTRDEF', ctrlType, properties: readonly ? { READONLY: 'true' } : {} });

const notebook = () => ({
  chapters: [{
    id: 'chapter',
    children: [
      property('name', 'STRING'),
      property('readonly', 'STRING', true),
      property('record', 'RECORD'),
      property('file', 'FILE_POINTER'),
      property('relation', 'RELATIONS'),
      { id: 'group', type: 'GROUP', children: [property('in-group', 'INTEGER'), property('group-readonly', 'STRING', true), property('group-relation', 'RELATIONS')] },
    ],
  }],
}) as unknown as AdonisNoteBook;

const ids = (filtered: AdonisNoteBook) => filtered.chapters[0].children.map(child =>
  child.type === 'GROUP' ? `${child.id}(${(child as any).children.map((c: { id: string }) => c.id).join(',')})` : child.id);

describe('isImportableClass', () => {
  it('accepts concrete repository classes', () => {
    expect(isImportableClass(adonisClass('C_APPLICATION'))).toBe(true);
  });

  it('rejects abstract, non-repository, UML and system classes', () => {
    expect(isImportableClass(adonisClass('C_ABSTRACT', true))).toBe(false);
    expect(isImportableClass(adonisClass('C_MODEL_ONLY', false, false))).toBe(false);
    expect(isImportableClass(adonisClass('C_UML_CLASS'))).toBe(false);
    expect(isImportableClass(adonisClass('REPOSITORY'))).toBe(false);
    expect(isImportableClass(adonisClass('C_CLOUD_TASK'))).toBe(false);
  });
});

describe('filterNotebook', () => {
  it('keeps writable attributes and relations for configurations', () => {
    expect(ids(filterNotebook(notebook(), 'config'))).toEqual(['name', 'relation', 'group(in-group,group-relation)']);
  });

  it('removes relations for the direct import', () => {
    expect(ids(filterNotebook(notebook(), 'import'))).toEqual(['name', 'group(in-group)']);
  });

  it('does not change the original notebook', () => {
    const original = notebook();
    filterNotebook(original, 'import');

    expect(original.chapters[0].children.length).toBe(6);
    expect((original.chapters[0].children[5] as any).children.length).toBe(3);
  });
});
