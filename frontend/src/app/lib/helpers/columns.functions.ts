import { AdonisAttribute } from '../interfaces/adonis-attribute.interface';
import { AttributeOrRelation, AdonisNotebookRelations } from '../interfaces/adonis-notebook-elements.interface'
import { Column } from '../models/rest-backend/column.model'
import { RELATIONS, stringAttributes } from '../string.constants';

export function createColumnsFromProperties(properties: AttributeOrRelation[]) {
    const columns: Column[] = [];
    properties.forEach(p => {
        const c: Column = {
            displayName: p.displayNames.de,
            internalName: p.metaName,
            typeInfo: {
                allowedTypes: [p.ctrlType],
                sqlType: ''
            },
            hasDefaultValue: false,
            isNullable: false,
            ordinalPosition: 0,
            primary: false,
            relation: p.type === RELATIONS,
            unique: false,
            characterData: undefined,
            relationTarget: undefined,
        }
    });
}