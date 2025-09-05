export const STORE = 'STORE';

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
export const ENUMLIST = 'ENUMLIST';
export const ENUMLIST_TREE = 'ENUMLIST_TREE';
export const enumAttributes = [ENUM, ENUMLIST, ENUMLIST_TREE];
export const BOOL = 'BOOL';
export const RECORD = 'RECORD';
export const FILE_POINTER = 'FILE_POINTER';

