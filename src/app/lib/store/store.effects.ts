import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { DataAccess } from '../data-access/data-access';

import * as StoreActions from './store.actions';
import { ClassContainer } from '../interfaces/container-class.interface';
import { NotebookContainer } from '../interfaces/container-notebook.interface';
import { AttributeContainer } from '../interfaces/container-attribute.interface';

const getClasses = (classContainer: ClassContainer) => Object.values(classContainer);

@Injectable({providedIn: 'root'})
export class StoreEffects {
    retrieveClasses$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.LoadClasses),
        switchMap(() => this.dataAccess.retrieveClassesWithNotebooks().pipe(
            map(classContainer => StoreActions.ClassesLoaded({classContainer})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.ClassesLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    loadAttributeTypes$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map(() => StoreActions.LoadAttributeTypes()),
    ));

    loadNotebooks$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map((action) => StoreActions.LoadNotebooks({classes: getClasses(action.classContainer)})),
    ));

    loadAttributes$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map((action) => StoreActions.LoadAttributes({classes: getClasses(action.classContainer)})),
    ));

    retrieveAttributeTypes$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.LoadAttributeTypes),
        switchMap(() => this.dataAccess.retrieveAttributeTypes().pipe(
            map(attributeTypes => StoreActions.AttributeTypesLoaded({attributeTypes})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.AttributeTypesLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    retrieveNotebooks$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.LoadNotebooks),
        switchMap(action => this.dataAccess.retrieveNotebooksForClasses(action.classes).pipe(
            map(notebooks => {
                const notebookContainer: NotebookContainer = {};
                notebooks.forEach(n => {
                    const key = Object.keys(n)[0];
                    notebookContainer[key] = n[key];
                });
                return StoreActions.NotebooksLoaded({notebookContainer})
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.NotebooksLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));
    
    retrieveAttributes$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.LoadAttributes),
        switchMap(action => this.dataAccess.retrieveAttributesForClasses(action.classes).pipe(
            map(properties => {
                const attributesContainer: AttributeContainer = {};
                properties.forEach(p => {
                    const key = Object.keys(p)[0];
                    attributesContainer[key] = p[key];
                });
                return StoreActions.AttributesLoaded({attributesContainer});
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.AttributesLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    constructor(private actions$: Actions, private dataAccess: DataAccess) {}
}