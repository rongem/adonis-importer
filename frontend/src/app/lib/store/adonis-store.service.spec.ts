import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisStoreService } from './adonis-store.service';

const adonisClass = (id: string, name: string) => ({ id, metaName: id, displayNames: { de: name } }) as AdonisClass;

const attribute = (id: string) => ({ id, metaName: id, type: 'ATTRDEF', ctrlType: 'STRING', properties: {}, displayNames: { de: id } });

describe('AdonisStoreService', () => {
  let store: AdonisStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AdonisStoreService);
  });

  it('sorts classes by German display name without changing the original order', () => {
    store.setRepositoryClasses({
      c1: adonisClass('c1', 'Zeitplan'),
      c2: adonisClass('c2', 'Änderung'),
      c3: adonisClass('c3', 'Anwendung'),
      c4: adonisClass('c4', 'Bericht'),
    } as unknown as AdonisClassContainer);

    expect(store.sortedClasses().map(c => c.displayNames.de)).toEqual(['Änderung', 'Anwendung', 'Bericht', 'Zeitplan']);
    expect(store.classes().map(c => c.id)).toEqual(['c1', 'c2', 'c3', 'c4']);
  });

  it('returns no properties as long as the notebook of the selected class is missing', () => {
    store.selectClass(adonisClass('c1', 'Prozess'));

    expect(store.selectedClassesProperties()).toEqual([]);
  });

  it('collects properties from groups and chapters of the selected notebook', () => {
    store.setNotebooks({
      c1: {
        chapters: [{
          children: [
            { id: 'g1', type: 'GROUP', children: [attribute('a1'), attribute('a2')] },
            attribute('a3'),
          ],
        }],
      },
    } as unknown as AdonisNotebookContainer);
    store.selectClass(adonisClass('c1', 'Prozess'));

    expect(store.selectedClassesProperties().map(p => p.id)).toEqual(['a1', 'a2', 'a3']);
  });
});
