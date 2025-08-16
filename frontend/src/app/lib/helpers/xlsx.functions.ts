import * as XLSX from 'xlsx';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';

export function createXLFile(adonisClass: AdonisClass, attributes: AttributeOrRelation[]) {
    const obj: {[key: string]: string} = {};
    attributes.forEach(a => obj[a.displayNames.de] = 'Test');

    const ws = XLSX.utils.json_to_sheet([obj]);
    
    const wb = XLSX.utils.book_new(ws, adonisClass.displayNames.de);

    XLSX.writeFile(wb, 'Import ' + adonisClass.displayNames.de + '.xlsx');
};
