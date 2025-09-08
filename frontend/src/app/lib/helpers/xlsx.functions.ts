import * as XLSX from 'xlsx';
import { AdonisNotebookRelations, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import * as Constants from '../string.constants';

export function createXLFile(adonisClass: AdonisClass, properties: AttributeOrRelation[]) {
    const obj: {[key: string]: string} = {};
    properties.forEach(p => {
        switch (p.type) {
            case Constants.ATTRDEF:
                obj[p.displayNames.de] = 'Test';
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
