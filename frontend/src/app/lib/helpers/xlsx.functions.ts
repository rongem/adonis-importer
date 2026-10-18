import { AdonisNotebookAttribute, AdonisNotebookRelations, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import * as Constants from '../string.constants';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { createXlsx, XlsxCellValue, XlsxColumn } from './xlsx-writer.functions';

// create an Excel template with one example row, matching the XML configuration
export function createXLFile(adonisClass: AdonisClass, properties: AttributeOrRelation[], attributes: AdonisAttributeContainer) {
    const columns: XlsxColumn[] = [];
    const exampleRow: XlsxCellValue[] = [];
    properties.forEach(p => {
        switch (p.type) {
            case Constants.ATTRDEF:
                const attribute = p as AdonisNotebookAttribute;
                columns.push({
                    header: p.displayNames.de,
                    listValues: getListValues(attribute, attributes),
                });
                exampleRow.push(getDemoContent(attribute, attributes));
                break;
            case Constants.RELATIONS:
                const r = p as AdonisNotebookRelations;
                columns.push({ header: r.displayNames.de + ' ' + (r.incoming ? '<-' : '->') + ' ' + r.relClass.targetInformations[0].metaName });
                exampleRow.push('Objekt-Test');
        }
    });

    return createXlsx({ name: adonisClass.displayNames.de, columns, rows: [exampleRow] });
};

export function xlFileName(adonisClass: AdonisClass) {
    return 'Import ' + adonisClass.displayNames.de + '.xlsx';
}

function getDemoContent(property: AdonisNotebookAttribute, attributes: AdonisAttributeContainer) {
    if (Constants.dateAttributes.includes(property.ctrlType)) {
        return new Date();
    }
    switch (property.ctrlType) {
        case Constants.ENUM:
            return getEnumValues(property, attributes)[0];
        case Constants.ENUMLIST:
        case Constants.ENUMLIST_TREE:
            return getEnumValues(property, attributes).join(Constants.enumListSeparator);
        case Constants.BOOL:
            return Constants.boolMapping[0];
        default:
            return 'Test';
    }
}

// values offered as dropdown; multi value enums are excluded, because a dropdown allows only one value
function getListValues(property: AdonisNotebookAttribute, attributes: AdonisAttributeContainer) {
    switch (property.ctrlType) {
        case Constants.ENUM:
            return getEnumValues(property, attributes);
        case Constants.BOOL:
            return Constants.boolMapping;
        default:
            return undefined;
    }
}

function getEnumValues(property: AttributeOrRelation, attributes: AdonisAttributeContainer) {
    const attribute = attributes[property.id];
    return (attribute?.constraints.de ?? '').split('@').filter(v => v !== '');
}
