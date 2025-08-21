import { AttributeOrRelation, AdonisNotebookRelations, AdonisNotebookAttribute } from '../models/adonis-rest/metadata/notebook-elements.interface'
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { Column } from '../models/table/column.model'
import * as Constants from '../string.constants';

export function createColumnsFromProperties(properties: AttributeOrRelation[], attributes: AdonisAttributeContainer) {
    const columns: Column[] = [createColumnFromAttribute(properties[0] as AdonisNotebookAttribute, 0, attributes)];
    for (let i = 1; i < properties.length; i++) {
        const property = properties[i];
        switch (property.type) {
            case Constants.ATTRDEF:
                columns.push(createColumnFromAttribute(property as AdonisNotebookAttribute, i, attributes));
                break;
            case Constants.RELATIONS:
                columns.push(createColumnFromRelation(property as AdonisNotebookRelations, i));
                break;
        }
    }
    return columns;
}

const createColumnFromAttribute = (property: AdonisNotebookAttribute, ordinalPosition: number, attributes: AdonisAttributeContainer): Column => ({
    displayName: property.displayNames.de,
    internalName: property.metaName,
    ordinalPosition,
    hasDefaultValue: false,
    isNullable: getAttributeColumnTypes(property).length === 0,
    primary: ordinalPosition === 0,
    unique: ordinalPosition === 0,
    relation: false,
    allowedTypes: getAttributeColumnTypes(property),
    property: {
        attribute: property,
        attributeInfo: attributes[property.id],
    },
    enumData: Constants.enumAttributes.includes(property.ctrlType) ? getEnumContent(property, attributes) : undefined,
});

const createColumnFromRelation = (relation: AdonisNotebookRelations, ordinalPosition: number): Column => {
    const targetName = relation.relClass.targetInformations[0].metaName;
    return {
        displayName: relation.displayNames.de + ' -> ' + targetName,
        internalName: relation.metaName,
        ordinalPosition,
        hasDefaultValue: false,
        isNullable: true,
        primary: false,
        unique: false,
        relation: true,
        allowedTypes: ['string'],
        property: {
            relation,
        },
    }};

const getAttributeColumnTypes = (attribute: AdonisNotebookAttribute) => {
    if (Constants.stringAttributes.includes(attribute.ctrlType)) {
        return ['string'];
    }
    if (Constants.numberAttributes.includes(attribute.ctrlType)) {
        return ['number'];
    }
    if (Constants.dateAttributes.includes(attribute.ctrlType)) {
        return ['date', 'string'];
    }
    if (attribute.ctrlType === Constants.BOOL) {
        return ['boolean', 'string'];
    }
    if (Constants.enumAttributes.includes(attribute.ctrlType)) {
        return ['string'];
    }
    return [];
}

function getEnumContent(property: AttributeOrRelation, attributes: AdonisAttributeContainer) {
    const attribute = attributes[property.id];
    const values = attribute.constraints.de.split('@');
    const aliases = values.map((v, i) => 'v' + i.toString());
    return {values, aliases};
}
