import { createAction, props } from '@ngrx/store';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { CellContent } from '../models/table/cellcontent.model';
import { RowContainer } from '../models/table/row-container.model';
import { Column } from '../models/table/column.model';
import { AdonisRepoList } from '../models/adonis-rest/metadata/lists/list-repos.interface';
import { AdonisObjectGroup } from '../models/adonis-rest/metadata/object-group.interface';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { ExportAction } from '../enums/export-action.enum';

export const LoadClasses = createAction('[App] Start loading Classes.');

export const LoadAttributes = createAction('[App] Start loading Attributes.',
    props<{classes: AdonisClass[]}>()
);
export const LoadNotebooks = createAction('[App] Start loading Notebook for a class.',
    props<{classes: AdonisClass[]}>()
);

export const ClassesLoaded = createAction('[App] Loading Classes finished.',
    props<{classContainer: AdonisClassContainer}>()
);
export const NotebooksLoaded = createAction('[App] Loading Notebooks finished.',
    props<{notebookContainer: AdonisNotebookContainer}>()
);

export const AttributesLoaded = createAction('[App] Loading Attributes finished.',
    props<{attributesContainer: AdonisAttributeContainer}>()
);

export const ClassesLoadingFailed = createAction('[App] Loading Classes failed.',
    props<{errorMessage: string}>()
);
export const NotebooksLoadingFailed = createAction('[App] Loading Notebooks failed.',
    props<{errorMessage: string}>()
);
export const AttributesLoadingFailed = createAction('[App] Loading Attributes failed.',
    props<{errorMessage: string}>()
);

export const ClassSelected = createAction('[Classes] Selected a class.',
    props<{selectedClass: AdonisClass}>()
);

export const PropertiesSelected = createAction('[Classes] Selected properties of a class.',
    props<{properties: AttributeOrRelation[]}>()
);

export const ActionSelected = createAction('[Classes] How the app should proceed.',
    props<{action: ExportAction}>()
);

export const setError = createAction('[Error] Set error',
    props<{ error?: string }>()
);

export const LoadRepositories = createAction('[Repository] Start loading repository list.');

export const RepositoriesLoaded = createAction('[Repository] Loading repository list finished.',
    props<{repositoryList: AdonisRepoList}>()
);

export const RepositoryLoadingFailed = createAction('[Repository] Loading repository list failed.',
    props<{errorMessage: string}>()
);

export const SelectRepository = createAction('[Repository] Select target repository.',
    props<{repositoryId: string}>()
);

export const LoadObjectGroups = createAction('[ObjectGroup] Start loading object group list.');

export const ObjectGroupsLoaded = createAction('[ObjectGroup] Loading object group list finished.',
    props<{objectGroup: AdonisObjectGroup}>()
);

export const ObjectGroupLoadingFailed = createAction('[ObjectGroup] Loading ObjectGroup list failed.',
    props<{errorMessage: string}>()
);

export const SelectObjectGroup = createAction('[ObjectGroup] Select Object Group.',
    props<{objectGroup: AdonisObjectGroup}>()
);

export const columnsLoaded = createAction('[Columns] Finished loading columns',
    props<{columns: Column[]}>()
);

export const changeColumnOrder = createAction('[Columns] Changed order of table columns via drag & drop',
    props<{columnMappings: number[]}>()
);

export const setCellContents = createAction('[CellContent] Set new content for cells',
    props<{contents: CellContent[]}>()
);

export const testRowsInBackend = createAction('[Rows] Test rows in backend',
    props<{content: RowContainer}>()
);

export const importRowsInBackend = createAction('[Rows] Import rows in backend',
    props<{content: RowContainer}>()
);

export const setRowErrors = createAction('[Rows] Set list of row errors',
    // props<{errors: ErrorList[]}>()
);

export const backendTestSuccessful = createAction('[Rows] Test of rows in backend was successful');

export const importSuccessful = createAction('[Rows] Import successful',
    props<{importedRows: number}>()
);

export const noAction = createAction('[No Action] Simply do nothing, but don\'t break effects pipe');

