import { createAction, props } from '@ngrx/store';
import { ClassContainer } from '../interfaces/container-class.interface';
import { AttributeTypeContainer } from '../interfaces/container-attributetype.interface';
import { AdonisClass } from '../interfaces/adonis-class.interface';
import { NotebookContainer } from '../interfaces/container-notebook.interface';
import { AttributeContainer } from '../interfaces/container-attribute.interface';

export const LoadClasses = createAction('[App] Start loading Classes.');
export const LoadAttributeTypes = createAction('[App] Start loading AttributeTypes.');

export const LoadAttributes = createAction('[App] Start loading Attributes.',
    props<{classes: AdonisClass[]}>()
);
export const LoadNotebooks = createAction('[App] Start loading Notebook for a class.',
    props<{classes: AdonisClass[]}>()
);

export const ClassesLoaded = createAction('[App] Loading Classes finished.',
    props<{classContainer: ClassContainer}>()
);
export const AttributeTypesLoaded = createAction('[App] Loading AttributeTypes finished.',
    props<{attributeTypes: AttributeTypeContainer}>()
);
export const NotebooksLoaded = createAction('[App] Loading Notebooks finished.',
    props<{notebookContainer: NotebookContainer}>()
);

export const AttributesLoaded = createAction('[App] Loading Attributes finished.',
    props<{attributesContainer: AttributeContainer}>()
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
export const AttributeTypesLoadingFailed = createAction('[App] Loading AttributeTypes failed.',
    props<{errorMessage: string}>()
);

