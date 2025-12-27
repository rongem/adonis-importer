import { AdonisBasicObject } from "../metadata/basic-type.interface";
import { AdonisSearchResultItem } from "../search/result.interface";

export interface AdonisRestItem {
    locale: string;
    item: AdonisItem;
}

export interface AdonisItem extends AdonisSearchResultItem {
    chainId: string;
    groupId: string
    link: {
        href: string;
    },
    icon: {
        href: string;
        rel: string;
    },
    attributes: AdonisAttributeValue[];
    relations: AdonisRelationTarget[];
}

export interface AdonisAttributeValue {
    name: string;
    metaName: string;
    attrType: string;
    value: string | number | boolean | string[];
    noValue?: boolean;
    timestamp?: number;
    metaValue?: string;
}

export interface AdonisRelationTarget extends AdonisBasicObject {
    libraryObjectId: string;
    chainId: string;
    type: string;
    artefactType: string;
    metaName: string;
    direction: 'INCOMING' | 'OUTGOING';
    link: {
        href: string;
    },
    icon: {
        href: string;
        rel: string;
    },
}