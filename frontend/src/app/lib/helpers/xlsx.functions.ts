import * as XLSX from 'xlsx';
import { AdonisNotebookAttribute, AdonisNotebookRelations, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import * as Constants from '../string.constants';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';

export function createXLFile(adonisClass: AdonisClass, properties: AttributeOrRelation[], attributes: AdonisAttributeContainer) {
    const obj: {[key: string]: string | Date | boolean} = {};
    properties.forEach(p => {
        switch (p.type) {
            case Constants.ATTRDEF:
                obj[p.displayNames.de] = getDemoContent(p as AdonisNotebookAttribute, attributes);
                break;
            case Constants.RELATIONS:
                const r = p as AdonisNotebookRelations;
                const propName = r.displayNames.de + ' ' + (r.relClass.incoming ? '<-' : '->') + ' ' + r.relClass.targetInformations[0].metaName;
                obj[propName] = 'Objekt-Test';
        }
    });

    const ws = XLSX.utils.json_to_sheet([obj]);
    
    const wb = XLSX.utils.book_new(ws, adonisClass.displayNames.de);

    XLSX.writeFile(wb, 'Import ' + adonisClass.displayNames.de + '.xlsx');
};

function getDemoContent(property: AdonisNotebookAttribute, attributes: AdonisAttributeContainer) {
    if (Constants.dateAttributes.includes(property.ctrlType)) {
        return new Date();
    }
    switch (property.ctrlType) {
        case Constants.ENUM:
        case Constants.ENUMLIST:
        case Constants.ENUMLIST_TREE:
            return getEnumContent(property, attributes);
        case Constants.BOOL:
            return true;
        default:
            return 'Test';
    }
}

function getEnumContent(property: AttributeOrRelation, attributes: AdonisAttributeContainer) {
    const attribute = attributes[property.id];
    const values = attribute.constraints.de.split('@');
    const returnvalue = values.join(';');
    return returnvalue;
}

