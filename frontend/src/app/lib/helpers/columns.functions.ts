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
        }
    }
    return columns;
}

const createColumnFromAttribute = (property: AdonisNotebookAttribute, ordinalPosition: number, attributes: AdonisAttributeContainer): Column => ({
    displayName: property.displayNames.de,
    internalName: property.metaName,
    ordinalPosition,
    hasDefaultValue: false,
    // only the name (primary column) is mandatory, empty cells leave existing values unchanged
    isNullable: ordinalPosition !== 0,
    primary: ordinalPosition === 0,
    unique: ordinalPosition === 0,
    allowedTypes: getAttributeColumnTypes(property),
    property: {
        attribute: property,
        attributeInfo: attributes[property.id],
    },
    enumData: Constants.enumAttributes.includes(property.ctrlType) ? getEnumContent(property, attributes) : undefined,
});

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
    const multiple = property.ctrlType !== Constants.ENUM;
    return {values, aliases, multiple};
}

// checks a cell value against an enumeration; enum lists may contain several values separated by enumListSeparator
export function isValidEnumValue(enumData: NonNullable<Column['enumData']>, value: string) {
    const values = enumData.multiple ? value.split(Constants.enumListSeparator) : [value];
    return values.every(v => enumData.values.includes(v));
}
