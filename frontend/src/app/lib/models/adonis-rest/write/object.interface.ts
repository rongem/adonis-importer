export interface EditObject {
    attributes: CreateAttribute[];
}

export interface CreateObject extends EditObject {
    metaName: string;
    name: string;
    groupId: string;
};

export interface CreateAttribute {
    metaName: string;
    value: string;
};
