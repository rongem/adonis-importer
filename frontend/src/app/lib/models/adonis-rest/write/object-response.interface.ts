import { AdonisLink } from "../metadata/link.interface";

export interface CreateObjectResponse {
    item: {
        artefactType?: string;
        attributes: CreateAttributeResponse[];
        groupId?: string;
        groupPath?: string;
        icon?: {
            href: string;
            rel: string;
        };
        id: string;
        libraryObjectId?: string;
        link?: {
            href: string;
        };
        metaName: string;
        modelId?: string;
        modelName?: string;
        name: string;
        relations?: CreateObjectRelationResponse[];
        rest_links?: AdonisLink[];
        rwf?: {
            icon: {
                groupName: string;
                key: string;
            };
            stableLink: {
                href: string;
            };
            state: string;
        };
        type?: string;
    };
    locale: string;
}

interface CreateAttributeResponse {
    attrType?: string;
    metaName: string;
    name?: string;
    value: string;
};

interface CreateObjectRelationResponse {
    metaName: string;
    name: string;
    targets: string[]
}