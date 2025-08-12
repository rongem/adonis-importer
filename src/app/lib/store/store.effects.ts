import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, iif, map, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { DataAccess } from '../data-access/data-access';
import * as StoreActions from './store.actions';
import { ClassContainer } from '../interfaces/container-class.interface';
import { NotebookContainer } from '../interfaces/container-notebook.interface';
import { ExportAction } from '../enums/export-action.enum';

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

    startLoadingNotebooks$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map((action) => StoreActions.LoadNotebooks({classes: getClasses(action.classContainer)})),
        tap(() => this.router.navigateByUrl('/classes')),
    ));

    startLoadingAttributes$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map((action) => StoreActions.LoadAttributes({classes: getClasses(action.classContainer)})),
    ));

    startLoadingRepositories$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassesLoaded),
        map(() => StoreActions.LoadRepositories()),
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
            map(attributesContainer => StoreActions.AttributesLoaded({attributesContainer})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.AttributesLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    retrieveRepositories$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.LoadRepositories),
        switchMap(() => this.dataAccess.retrieveRepositories().pipe(
            map(repositoryList => StoreActions.RepositoriesLoaded({repositoryList})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.RepositoryLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    checkAndSetRepo$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.RepositoriesLoaded),
        switchMap((action) => iif(() => action.repositoryList.repos.length === 1,
            of(StoreActions.SelectRepository({repositoryId: action.repositoryList.repos[0].id})),
            of(StoreActions.noAction()))
        ),
    ));

    selectRepository$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.SelectRepository),
        switchMap((action) => this.dataAccess.retrieveObjectGroupStructure(action.repositoryId).pipe(
            map(objectGroupList => StoreActions.ObjectGroupsLoaded({objectGroup: objectGroupList.group})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.ObjectGroupLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    selectClass$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassSelected),
        tap(action => this.router.navigate(['classes', action.selectedClass.metaName])),
    ), {dispatch: false});

    selectProperties$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.PropertiesSelected),
        tap(() => this.router.navigate(['choose-export-import'])),
    ), {dispatch: false});

    selectAction$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ActionSelected),
        tap((action) => {
            switch (action.action) {
                case ExportAction.ExportFiles:
                    this.router.navigate(['export-files']);
                    break;
                case ExportAction.ImportViaRest:
                    this.router.navigate(['import-rest']);
                    break;
                default:
                    this.router.navigateByUrl('/');
            }
        }),
    ), {dispatch: false});

    constructor(private actions$: Actions, private dataAccess: DataAccess, private router: Router) {}
}