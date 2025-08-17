import { AdonisBasicObject, AdonisRestObject } from '../metadata/basic-type.interface';

export interface AdonisSearchResult extends AdonisRestObject {
    hitsTotal: number;
    locale: string;
    rangeStart: number;
    rangeEnd: number;
    items: AdonisItem[];
}

export interface AdonisItem extends AdonisBasicObject {
    libraryObjectId: string;
    name: string;
    type: string;
    artefactType: string;
    metaName: string;
}
