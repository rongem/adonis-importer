interface CommonObject {
    attributes: CreateAttribute[];
    metaName: string;
    name: string;
};

export interface EditObject extends CommonObject {
    id: string;
};

export interface CreateObject extends CommonObject {
    groupId: string;
};

export interface CreateAttribute {
    metaName: string;
    value: string;
};
