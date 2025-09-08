import { XMLBuilder } from 'fast-xml-parser';
import { AdonisNotebookRelations, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import * as Constants from '../string.constants';

export function createXML(adonisClass: AdonisClass, properties: AttributeOrRelation[], attributes: AdonisAttributeContainer) {
    const b = new XMLBuilder({ignoreAttributes: false, format: true, });
    const out = {
        adoxx: {
            '@_platformversion': '28.1.54525',
            conf: {
                sheet: {
                    '@_name': adonisClass.displayNames.de,
                    '@_class_name': adonisClass.metaName,
                    '@_data_row': '2',
                    '@_id': '1',
                    '@_relation': properties.some(a => a.type === Constants.RELATIONS) ? 'TRUE' : undefined,
                    attribute: properties.map((value, index) => ({
                        '@_name': value.metaName,
                        '@_column': (index + 1).toString(),
                        '@_context': 'de',
                        ...getAttributeType(value, attributes),
                    })),
                }
            }
        }
    };
    return '<?xml version="1.0" encoding="UTF-8" ?>\n' + b.build(out).toString();
};

function getAttributeType(property: AttributeOrRelation, attributes: AdonisAttributeContainer) {
    switch (property.type) {
        case Constants.ATTRDEF:
            if (Constants.simpleAttributes.includes(property.ctrlType)){
                return {'@_type': 'simple'};
            }
            if (Constants.dateAttributes.includes(property.ctrlType)) {
                return {
                    '@_type': 'date',
                    ...getTimeZoneOffset(),
                };
            }
            switch (property.ctrlType) {
                case Constants.ENUM:
                    return {
                        '@_type': 'enum',
                        '@_domain_mapping': getEnumContent(property, attributes),
                        '@_separator_domain_mapping': '|',
                    };
                case Constants.ENUMLIST:
                    return {
                        '@_type': 'enum_list',
                        '@_separator': '@',
                        '@_domain_mapping': getEnumContent(property, attributes),
                        '@_separator_domain_mapping': '|',
                    };
                case Constants.ENUMLIST_TREE:
                    return {
                        '@_type': 'treeenumlist',
                        '@_separator': '@',
                    };
                case 'BOOL':
                    return {
                        '@_type': 'bool',
                        '@bool_mapping': 'Ja,Nein'
                    };
                default:
                    return {'@_type': 'error ' + property.ctrlType};
            }
        case Constants.RELATIONS:
            const p = property as AdonisNotebookRelations;
            return {
                '@_type': 'relation',
                '@_separator': '|',
                '@_attr_separator': '@',
                '@_lookup_attr_name': 'NAME',
                '@_direction': p.incoming ? 'FROM' : 'TO',
                '@_target_class': p.relClass.targetInformations[0].metaName,
                '@_strategy': 'overwrite',
            };
        case Constants.FILE_POINTER:
            return {
                '@_type': 'file_pointer',
                '@_separator': '|',
            };
        default:
            console.error(property.type);
            return {'@_type': 'error ' + property.ctrlType};
    }
}

function getTimeZoneOffset() {
    const offset = -(new Date().getTimezoneOffset());
    const offSetHours = Math.abs(offset / 60);
    const offsetMinutes = offset - 60 * offSetHours;
    return { '@_utc_offset_hours': offSetHours.toString(), '@_utc_offset_minutes': offsetMinutes.toString() };
}

function getEnumContent(property: AttributeOrRelation, attributes: AdonisAttributeContainer) {
    const attribute = attributes[property.id];
    const values = attribute.constraints.de.split('@');
    const returnvalue = values.map((v, i) => v + '|v' + i.toString()).join('|');
    return returnvalue;
}
