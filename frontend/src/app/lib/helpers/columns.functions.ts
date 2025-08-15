import { AttributeOrRelation, AdonisNotebookRelations, AdonisNotebookAttribute } from '../interfaces/adonis-notebook-elements.interface'
import { Column } from '../models/rest-backend/column.model'
import * as Constants from '../string.constants';

export function createColumnsFromProperties(properties: AttributeOrRelation[]) {
    const columns: Column[] = [createColumnFromAttribute(properties[0] as AdonisNotebookAttribute, 0)];
    for (let i = 1; i < properties.length; i++) {
        const property = properties[i];
        switch (property.type) {
            case Constants.ATTRDEF:
                columns.push(createColumnFromAttribute(property as AdonisNotebookAttribute, i));
                break;
            case Constants.RELATIONS:
                columns.push(createColumnFromRelation(property as AdonisNotebookRelations, i));
                break;
        }
    }
    return columns;
}

const createColumnFromAttribute = (attribute: AdonisNotebookAttribute, ordinalPosition: number): Column => ({
    displayName: attribute.displayNames.de,
    internalName: attribute.metaName,
    typeInfo: {
        allowedTypes: [attribute.ctrlType],
    },
    hasDefaultValue: false,
    isNullable: false,
    ordinalPosition,
    primary: ordinalPosition === 0,
    relation: false,
    unique: ordinalPosition === 0,
    characterData: undefined,
    relationTarget: undefined,
});

const createColumnFromRelation = (relation: AdonisNotebookRelations, ordinalPosition: number): Column => ({
    displayName: relation.displayNames.de,
    internalName: relation.metaName,
    hasDefaultValue: false,
    isNullable: false,
    ordinalPosition,
    primary: false,
    relation: true,
    typeInfo: {
        allowedTypes: [relation.type],
    },
    unique: false,
    characterData: undefined,
    relationTarget: {
        metaName: relation.relClass.targetInformations[0].metaName,
        id: relation.relClass.targetInformations[0].id,
    }
});
