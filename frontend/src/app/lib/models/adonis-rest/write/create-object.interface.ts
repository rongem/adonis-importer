export interface CreateObject {
    metaName: string;
    name: string;
    groupId: string;
    attributes: CreateAttribute[];
};

export interface CreateAttribute {
    metaName: string;
    value: string;
};
