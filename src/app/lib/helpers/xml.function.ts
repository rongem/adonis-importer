import { XMLBuilder } from 'fast-xml-parser';
import { AttributeOrRelation } from '../interfaces/adonis-notebook-elements.interface';
import { AdonisClass } from '../interfaces/adonis-class.interface';

export function createXML(adonisClass: AdonisClass, attributes: AttributeOrRelation[]) {
    const b = new XMLBuilder({ignoreAttributes: false, format: true});
    const out = {
        conf: {
            sheet: {
                '@_data_row': "2",
                '@_relation': attributes.some(a => a.type === 'RELATION') ? 'TRUE' : undefined,
                '@_id': "1",
                '@_classname': adonisClass.metaName,
                '@_name': adonisClass.displayNames.de,
                attribute: attributes.map((value, index) => ({
                    '@_name': value.metaName,
                    '@_column': (index + 1).toString(),
                    '@_context': 'de',
                    ...getAttributeType(value),
                })),
            }
        }
    };
    return b.build(out).toString();
};

const simpleAttributes = ['NAME', 'ADOSTRING', 'INTEGER', 'DOUBLE', 'SHORTSTRING', 'LONGSTRING', 'UNSIGNED INTEGER', 'STRING', 'STRING_MULTILINE'];
const dateAttributes = ['DATE', 'UTC'];

function getAttributeType(property: AttributeOrRelation) {
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
                        '@_domain_mapping': '',
                        '@_separator_domain_mapping': '|',
                    };
                case 'ENUMLIST':
                    return {
                        '@_type': 'enum_list',
                        '@_separator': '|',
                        '@_domain_mapping': '',
                        '@_separator_domain_mapping': '@',
                    };
                case 'ENUMLIST_TREE':
                    return {
                        '@_type': 'treeenumlist',
                        '@_separator': '|',
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
            return {
                '@_type': 'relation',
                '@_separator': '|',
                '@_attr_separator': '@',
                '@_lookup_attr_name': '',
                '@_direction': '', // FROM | TO
                '@_target_class': '',
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
