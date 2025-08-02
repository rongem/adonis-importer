import { createAction, props } from '@ngrx/store';
import { ClassContainer } from '../interfaces/class-container.interface';

export const LoadClasses = createAction('[App] Start loading Classes.');
export const LoadAttributes = createAction('[App] Start loading Attributes.');
export const LoadAttributeTypes = createAction('[App] Start loading AttributeTypes.');

export const ClassesLoaded = createAction('[App] Loading Classes finished.',
    props<{classContainer: ClassContainer}>()
);
export const AttributesLoaded = createAction('[App] Loading Attributes finished.');
export const AttributeTypesLoaded = createAction('[App] Loading AttributeTypes finished.');

export const ClassesLoadingFailed = createAction('[App] Loading Classes failed.',
    props<{errorMessage: string}>()
);
export const AttributesLoadingFailed = createAction('[App] Loading Attributes failed.',
    props<{errorMessage: string}>()
);
export const AttributeTypesLoadingFailed = createAction('[App] Loading AttributeTypes failed.',
    props<{errorMessage: string}>()
);

