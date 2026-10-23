// Rules which parts of the ADONIS metamodel can be imported
import { AdonisBasicClass } from '../models/adonis-rest/metadata/basic-class.interface';
import { AdonisNoteBook } from '../models/adonis-rest/metadata/notebook.interface';
import { AdonisNotebookGroup, AttributeOrGroupOrRelation, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { SessionPurpose } from '../store/adonis-store.service';
import { features } from '../features';
import * as Constants from '../string.constants';

const forbiddenClassNames = ['C_COMMENT_ACTION', 'C_EXTERNAL_CONFIGURATION', 'CLOUD_REPOSITORY', 'C_CLOUD_TASK', 'REPOSITORY'];

// concrete repository classes, without UML and system classes
export function isImportableClass(adonisClass: AdonisBasicClass) {
    return adonisClass.abstract === false &&
        adonisClass.repositoryClass === true &&
        !adonisClass.metaName.startsWith('C_UML') &&
        !forbiddenClassNames.includes(adonisClass.metaName);
}

// writable attributes; relations for the direct import only if the feature is switched on
function isImportableProperty(property: AttributeOrRelation, purpose: SessionPurpose) {
    return property.properties.READONLY !== 'true' &&
        property.ctrlType !== Constants.RECORD &&
        property.ctrlType !== Constants.FILE_POINTER &&
        (purpose === 'config' || features.relationImport || property.ctrlType !== Constants.RELATIONS);
}

// copy of the notebook that contains only importable properties
export function filterNotebook(notebook: AdonisNoteBook, purpose: SessionPurpose): AdonisNoteBook {
    return {
        ...notebook,
        chapters: notebook.chapters.map(chapter => ({
            ...chapter,
            children: chapter.children
                .map(child => child.type === Constants.GROUP
                    ? { ...child, children: (child as AdonisNotebookGroup).children.filter(p => isImportableProperty(p, purpose)) } as AdonisNotebookGroup
                    : child)
                .filter(child => child.type === Constants.GROUP || isImportableProperty(child as AttributeOrRelation, purpose)) as AttributeOrGroupOrRelation[],
        })),
    };
}
