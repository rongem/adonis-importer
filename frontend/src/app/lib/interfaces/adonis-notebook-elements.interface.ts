import { AdonisBasicNamedType } from "./adonis-basic-type.interface";

interface AdonisNotebookElement extends AdonisBasicNamedType {
    type: string;
}

export interface AttributeOrRelation extends AdonisNotebookElement {
    ctrlType: string;
    targetId: string;
    properties: {
        READONLY?: string;
        MAX_ROWS?: number;
        dom_id?: string;
        'relations.class'?: string;
    }
}

export interface AdonisNotebookAttribute extends AttributeOrRelation {
    attrType: string;
};

export interface AdonisNotebookRelations extends AdonisNotebookElement {
    incoming: boolean;
    relClass: {
        hasNotebook: boolean;
        targetInformations: {
                id: string;
                metaName: string;
                type: number
            }[];
        minOccurrences: number;
        maxOccurrences: number;
        reflexive: boolean;
        incoming: false
    }
};

export interface AdonisNotebookGroup extends AdonisNotebookElement {
    children: AttributeOrRelation[];
};

export type AttributeOrGroupOrRelation = AdonisNotebookAttribute | AdonisNotebookGroup | AdonisNotebookRelations;

export interface AdonisNotebookChapter extends AdonisNotebookElement {
    children: AttributeOrGroupOrRelation[];
}
