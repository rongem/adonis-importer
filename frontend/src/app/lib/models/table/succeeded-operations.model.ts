export interface SucceededImports {
    rowNumber: number;
    id: string;
    name: string;
    class: string;
    className: string;
    edited: boolean;
    created: boolean;
    attributes: SuceededAttribute[]
}

interface SuceededAttribute {
    name: string;
    value: string;
}

export interface SucceededRelations {
    rowNumber: number;
    fromClassName: string;
    fromName: string;
    toClassName: string;
    toName: string;
}