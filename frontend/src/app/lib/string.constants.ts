export const rel = '-rel';
export const RELATIONS = 'RELATIONS';
export const ATTRDEF = 'ATTRDEF';
export const GROUP = 'GROUP';
export const NAME = 'NAME';
export const attributes = 'attributes';
export const notebook = 'notebook';
export const self = 'self';
export const login_url = 'login';
export const classes_url = 'classes';
export const export_files_url = 'export-files';
export const choose_import_location_url = 'choose-import-location';
export const import_url = 'import';
export const import_test_url = 'import-test';
export const import_results_url = 'import-results';
export const repos_url = '4.0/repos/';
export const objectgroups_url = '/objectgroups/root?recursive=true';
export const search_query_url = '/search?query=';
export const objects_url = '/objects';
export const relations_url = '/relations/';

export const stringAttributes = ['NAME', 'ADOSTRING', 'SHORTSTRING', 'LONGSTRING', 'STRING', 'STRING_MULTILINE', 'COLOR'];
export const numberAttributes = ['INTEGER', 'DOUBLE', 'UNSIGNED INTEGER'];
export const simpleAttributes = [...stringAttributes, ...numberAttributes];
export const dateAttributes = ['DATE', 'UTC'];
export const ENUM = 'ENUM';
export const ENUMLIST = 'ENUM_LIST';
export const ENUMLIST_TREE = 'ENUMLIST_TREE';
export const enumAttributes = [ENUM, ENUMLIST, ENUMLIST_TREE];
// separator between multiple values in one Excel cell (attribute "separator" in the XML configuration).
// ADONIS itself separates enum values with @, so no value can contain it.
export const enumListSeparator = '@';
// platform version written into the XML import configuration (<adoxx platformversion="...">)
export const adoxxPlatformVersion = '28.1.54525';
export const BOOL = 'BOOL';
// values for true and false in the Excel template, used for bool_mapping in the XML configuration
export const boolMapping = ['ja', 'nein'];
export const RECORD = 'RECORD';
export const FILE_POINTER = 'FILE_POINTER';

