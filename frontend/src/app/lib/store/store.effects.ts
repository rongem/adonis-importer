import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, iif, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { DataAccess } from '../data-access/data-access';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { ExportAction } from '../enums/export-action.enum';
import { createColumnsFromProperties } from '../helpers/columns.functions';
import * as Constants from '../string.constants';
import * as StoreActions from './store.actions';
import * as Selectors from './store.selectors';
import { sortGroup } from '../helpers/group-sorter.functions';
import { ErrorList } from '../models/table/errorlist.model';
import { AdonisQuery } from '../models/adonis-rest/search/query.interface';

const getClasses = (classContainer: AdonisClassContainer) => Object.values(classContainer);

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
        tap(() => this.router.navigate([Constants.classes_url])),
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
                const notebookContainer: AdonisNotebookContainer = {};
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

    // if only one repository is present, directly load objectgroup structure. Otherwise, choose repository first
    checkAndSetRepo$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.RepositoriesLoaded),
        switchMap((action) => iif(() => action.repositoryList.repos.length === 1,
            of(StoreActions.SelectRepository({repositoryId: action.repositoryList.repos[0].id})),
            of(StoreActions.noAction()))
        ),
    ));

    selectRepository$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.SelectRepository),
        tap(action => this.dataAccess.repoId = action.repositoryId),
        switchMap(() => this.dataAccess.retrieveObjectGroupStructure().pipe(
            map(sortGroup),
            map(objectGroupList => StoreActions.ObjectGroupsLoaded({objectGroup: objectGroupList.group})),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                return of(StoreActions.ObjectGroupLoadingFailed({errorMessage: error.message}));
            }),
        )),
    ));

    selectClass$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ClassSelected),
        tap(action => this.router.navigate([Constants.classes_url, action.selectedClass.metaName])),
    ), {dispatch: false});

    selectAction$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.ActionSelected),
        tap((action) => {
            switch (action.action) {
                case ExportAction.ExportFiles:
                    this.router.navigate([Constants.export_files_url]);
                    break;
                case ExportAction.ImportViaRest:
                    this.router.navigate([Constants.choose_import_location_url]);
                    break;
                default:
                    this.router.navigateByUrl('/');
            }
        }),
    ), {dispatch: false});

    selectObjectGroup$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.SelectObjectGroup),
        tap(() => this.router.navigate([Constants.import_url])),
    ), {dispatch: false});

    createColumns$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.PropertiesSelected),
        withLatestFrom(this.store.select(Selectors.attributes), this.store.select(Selectors.classContainer)),
        map(([action, attributes, classes]) => StoreActions.columnsLoaded({columns: createColumnsFromProperties(action.properties, attributes, classes)})),
    ));

    testRows$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.testRows),
        map(action => {
            const rows = action.content.rows;
            const primaryColumn = action.content.columns.find(c => c.primary)!;
            const primaryValues = rows.map(r => r[primaryColumn.internalName]);
            const errors: ErrorList[] = [];
            primaryValues.forEach((value, row) => {
                if (primaryValues.filter(v1 => v1 === value).length > 1) {
                    errors.push({msg: 'Doppelter Primärschlüssel', row, rowContent: rows[row]});
                }
            });
            if (errors.length > 0) {
                return StoreActions.setRowErrors({errors});
            }
            return StoreActions.testRowsInBackend({content: action.content});
        }),
    ));

    testRowsInBackend$ = createEffect(() => this.actions$.pipe(
        ofType(StoreActions.testRowsInBackend),
        tap(action => {
            const rows = action.content.rows;
            const primaryColumn = action.content.columns.find(c => c.primary)!;
            const selectedClass = action.content.selectedClass;
            const query: AdonisQuery = {
                filters: [{
                    className: selectedClass.metaName,
                }, {
                    attrName: Constants.NAME,
                    op: 'OP_EQ',
                    values: rows.map(r => r[primaryColumn.internalName]!.toString())
                }]
            };
            const queryString = encodeURIComponent(JSON.stringify(query));
            this.dataAccess.searchObjects(queryString);
        }),
    ), {dispatch: false});

    constructor(private actions$: Actions, private dataAccess: DataAccess, private router: Router, private store: Store) {}
}