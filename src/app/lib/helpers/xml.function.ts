import { XMLBuilder } from 'fast-xml-parser';
import { AdonisNotebookRelations, AttributeOrRelation } from '../interfaces/adonis-notebook-elements.interface';
import { AdonisClass } from '../interfaces/adonis-class.interface';
import { AttributeContainer } from '../interfaces/container-attribute.interface';

export function createXML(adonisClass: AdonisClass, properties: AttributeOrRelation[], attributes: AttributeContainer) {
    const b = new XMLBuilder({ignoreAttributes: false, format: true});
    const out = {
        conf: {
            sheet: {
                '@_data_row': "2",
                '@_relation': properties.some(a => a.type === 'RELATION') ? 'TRUE' : undefined,
                '@_id': "1",
                '@_classname': adonisClass.metaName,
                '@_name': adonisClass.displayNames.de,
                attribute: properties.map((value, index) => ({
                    '@_name': value.metaName,
                    '@_column': (index + 1).toString(),
                    '@_context': 'de',
                    ...getAttributeType(value, attributes),
                })),
            }
        }
    };
    return b.build(out).toString();
};

const simpleAttributes = ['NAME', 'ADOSTRING', 'INTEGER', 'DOUBLE', 'SHORTSTRING', 'LONGSTRING', 'UNSIGNED INTEGER', 'STRING', 'STRING_MULTILINE', 'COLOR'];
const dateAttributes = ['DATE', 'UTC'];

function getAttributeType(property: AttributeOrRelation, attributes: AttributeContainer) {
    switch (property.type) {
        case 'ATTRDEF':
            if (simpleAttributes.includes(property.ctrlType)){
                return {'@_type': 'simple'};
            }
            if (dateAttributes.includes(property.ctrlType)) {
                return {
                    '@_type': 'date',
                    ...getTimeZoneOffset(),
                };
            }
            switch (property.ctrlType) {
                case 'ENUM':
                    return {
                        '@_type': 'enum',
                        '@_domain_mapping': getEnumContent(property, attributes),
                        '@_separator_domain_mapping': '|',
                    };
                case 'ENUMLIST':
                    return {
                        '@_type': 'enum_list',
                        '@_separator': '@',
                        '@_domain_mapping': getEnumContent(property, attributes),
                        '@_separator_domain_mapping': '|',
                    };
                case 'ENUMLIST_TREE':
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
        case 'RELATIONS':
            const p = property as unknown as AdonisNotebookRelations;
            return {
                '@_type': 'relation',
                '@_separator': '|',
                '@_attr_separator': '@',
                '@_lookup_attr_name': 'NAME',
                '@_direction': p.incoming ? 'FROM' : 'TO',
                '@_target_class': p.relClass.targetInformations[0].metaName,
                '@_strategy': 'overwrite',
            };
        case 'FILE_POINTER':
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

function getEnumContent(property: AttributeOrRelation, attributes: AttributeContainer) {
    const attribute = attributes[property.id];
    const values = attribute.constraints.de.split('@');
    const returnvalue = values.map((v, i) => v + '|v' + i.toString()).join('|');
    console.log(returnvalue);
    return returnvalue;
}
