export interface AdonisQuery {
    filters: SearchFilter[],
    scope?: {
        repoObjects?: boolean,
        models?: boolean,
        modObjects?: boolean
    }
}

export interface AdonisClassFilter {
    className: string | string[];
    excluding?: boolean;
}

interface CommonFilterProperties {
    logOp?: 'OR' |'AND',
    phrasalSearch?: boolean,
    caseInsensitive?: boolean,
}

export interface AdonisAttributeFilter extends CommonFilterProperties {
    attrName: string,
    attrID?: string,
    op: searchOperator,
    value?: string | number | boolean | Date,
    values?: string[] | number[] | boolean[] | Date[],
    checkOwnerModel?: boolean,
}

export interface AdonisRelationFilter extends CommonFilterProperties {
    relName: string,
    targetClassName?: string[],
    incoming?: boolean,
    outgoing?: boolean,
}

type searchOperator = 'OP_EQ' | 'OP_EQUALS' | 'OP_NEQ' | 'OP_LIKE' | 'OP_NLIKE' | 'OP_REGEX' | 'OP_EMPTY' | 'OP_CONTAINS_ANY' |
        'OP_GR' | 'OP_GR_EQ' | 'OP_LE' | 'OP_LE_EQ' | 'OP_MATCH_ALL' | 'OP_NEMPTY' | 'OP_NRANGE' | 'OP_RANGE';

export type SearchFilter = AdonisClassFilter | AdonisAttributeFilter | AdonisRelationFilter;
