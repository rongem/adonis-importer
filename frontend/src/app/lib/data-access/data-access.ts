import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, map, mergeMap, Observable, of, switchMap, take, tap } from 'rxjs';
import { AdonisClassList } from '../models/adonis-rest/metadata/lists/list-class.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisNoteBook } from '../models/adonis-rest/metadata/notebook.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookGroup, AttributeOrGroupOrRelation, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisBasicClass } from '../models/adonis-rest/metadata/basic-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisAttribute } from '../models/adonis-rest/metadata/attribute.interface';
import { AdonisAttributeList } from '../models/adonis-rest/metadata/lists/list-attribute.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AdonisGroupContainer } from '../models/adonis-rest/metadata/group.interface';
import { AdonisRepoList } from '../models/adonis-rest/metadata/lists/list-repos.interface';
import * as Constants from '../string.constants';
import { AdonisSearchResult } from '../models/adonis-rest/search/result.interface';
import { CreateObject, EditObject } from '../models/adonis-rest/write/object.interface';
import { CreateObjectResponse } from '../models/adonis-rest/write/object-response.interface';
import { CreateRelationResponse, DirectionType } from '../models/adonis-rest/write/relation.interface';
import { idToUrl } from '../helpers/url.functions';
import { AdonisItem } from '../models/adonis-rest/read/item.interface';
import { RelationOperation, RowOperation } from '../models/table/row-operations.model';
import { ErrorList } from '../models/table/errorlist.model';
import { SucceededImports, SucceededRelations } from '../models/table/succeeded-operations.model';

@Injectable({
  providedIn: 'root'
})
export class DataAccess {
  private readonly http = inject(HttpClient);
  private baseUrl = '';

  private retrieveClasslist = () => this.getUrl<AdonisClassList>(this.baseUrl + '4.0/metamodel/classes');

  private getUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(take(1));
  }

  private postUrl<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body).pipe(take(1));
  }

  private patchUrl<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body).pipe(take(1));
  }

  repoId: string = '';

  retrieveClassesWithNotebooks = (baseUrl: string) => {
    this.baseUrl = baseUrl;
    return this.retrieveClasslist().pipe(
      map(m => {
        const forbiddenNames = ['C_COMMENT_ACTION', 'C_EXTERNAL_CONFIGURATION', 'CLOUD_REPOSITORY', 'C_CLOUD_TASK', 'REPOSITORY'];
        return m.classes.filter(c => c.abstract === false && c.repositoryClass === true && !c.metaName.startsWith('C_UML') && !forbiddenNames.includes(c.metaName));
      }),
      mergeMap(this.retrieveClassDetails),
      // mergeMap(this.retrieveNotebooksForClasses),
      map(classes => {
        const classContainer: AdonisClassContainer = {};
        classes.forEach(c => {
          classContainer[c.id] = c;
        });
        return classContainer;
      }),
    );
  };

  private retrieveClassDetails = (classes: AdonisBasicClass[]) => {
    const classDetails = classes.map(c => {
      const classUrl = c.rest_links.find(l => l.rel === Constants.self)!.href;
      return this.getUrl<AdonisClass>(classUrl);
    });
    return forkJoin(classDetails);
  };

  private filterChildren = (p: AttributeOrRelation) => p.properties.READONLY !== 'true' && p.ctrlType !== Constants.RECORD && p.ctrlType !== Constants.FILE_POINTER;
  private filterChapterChildren = (p: AttributeOrGroupOrRelation) => p.type === Constants.GROUP || this.filterChildren(p as AttributeOrRelation);

  retrieveNotebooksForClasses = (classes: AdonisClass[]) => {
    const notebooks = classes.map(c => {
      const notebookUrl = c.rest_links.find(l => l.rel === Constants.notebook)!.href;
      return this.getUrl<AdonisNoteBook>(notebookUrl).pipe(
        map(n => {
          const groups = n.chapters.map(ch => ch.children.filter(chi => chi.type === Constants.GROUP)).flat() as AdonisNotebookGroup[];
          groups.forEach(g => { // remove duplicate values, because of error in ADONIS REST API
            g.children.forEach((ch, index) => {
              if (g.children.filter(chi => chi.id === ch.id).length > 1) {
                g.children.splice(index, 1);
              }
            });
          });
          groups.forEach(g => { // remove non-importable attributes
            g.children = g.children.filter(this.filterChildren);
          })
          n.chapters.forEach(ch => ch.children = ch.children.filter(this.filterChapterChildren));
          return { [c.id]: n } as AdonisNotebookContainer;
        }),
      );
    });
    return forkJoin(notebooks);
  };

  retrieveAttributesForClasses = (classes: AdonisClass[]) => {
    const attributeContainer: {[key: string]: string} = {};
    const attributes = classes.map(c => {
      const attributesUrl = c.rest_links.find(l => l.rel === Constants.attributes)!.href;
      return this.getUrl<AdonisAttributeList>(attributesUrl).pipe(
        map(al => {
          const attributeIds = al.attributes.map(a => a.id);
          const attributeUrl = al.attributes.map(a => a.rest_links.find(l => l.rel === Constants.self)!.href);
          for (let index = 0; index < attributeIds.length; index++) {
            if (!attributeContainer[attributeIds[index]]) {
              attributeContainer[attributeIds[index]] = attributeUrl[index];
            }
          }
        }),
      );
    });
    return forkJoin(attributes).pipe(
      mergeMap(() => {
        const attributes = Object.keys(attributeContainer).map(k => this.getUrl<AdonisAttribute>(attributeContainer[k]));
        return forkJoin(attributes);
      }),
      map(attributes => {
        const container: AdonisAttributeContainer = {};
        attributes.forEach(a => {
          container[a.id] = a;
        });
        return container;
      }),
    );
  };

  private get repoUrl() { return this.baseUrl + Constants.repos_url + idToUrl(this.repoId); }

  retrieveRepositories = () => this.getUrl<AdonisRepoList>(this.baseUrl + Constants.repos_url);

  retrieveObjectGroupStructure = () => this.getUrl<AdonisGroupContainer>(this.repoUrl + Constants.objectgroups_url);

  searchObjects = (queryString: string) => this.getUrl<AdonisSearchResult>(this.repoUrl + Constants.search_query_url + queryString);

  retrieveSearchObjects = (queryString: string) => this.searchObjects(queryString).pipe(
    mergeMap(result => {
      const objectDetails = result.items.map(i => this.getUrl<AdonisItem>(i.rest_links.find(l => l.rel === Constants.self)!.href));
      return forkJoin(objectDetails);
    }),
  );

  createObject = (newObject: CreateObject) => this.postUrl<CreateObjectResponse>(this.repoUrl + Constants.objects_url, newObject);
  
  editObject = (existingObject: EditObject, id: string) => this.patchUrl<CreateObjectResponse>(this.repoUrl + Constants.objects_url + '/' + idToUrl(id), existingObject);

  createRelation = (sourceId: string, direction: DirectionType, relationClassName: string, relationTargetId: string) => 
    this.postUrl<CreateRelationResponse>(this.repoUrl + Constants.objects_url + '/' + idToUrl(sourceId) + Constants.relations_url + direction + '/' + relationClassName,
    direction.toLocaleLowerCase() === 'incoming' ? { fromId: relationTargetId } : { toId: relationTargetId });

  importItems = async (rowOperations: RowOperation[]) => {
    let errors: ErrorList[];
    const creationAndEditAttributeOperations = this.createOrEditItems(rowOperations);
    const operations = await Promise.all(creationAndEditAttributeOperations);
    errors = operations.filter(o => !!o.error).map(o => ({ row: o.rowNumber, msg: o.error!.status === 403 ? 'Keine Schreibrechte' : o.error!.message}));
    // this.store.dispatch(StoreActions.setImportErrors({errors}));
    const succeededOperations = operations.filter(o => !o.error);
    const entries: SucceededImports[] = succeededOperations.map(o => ({
        rowNumber: o.rowNumber,
        id: o.importedObject!.item.id,
        class: o.importedObject!.item.metaName,
        className: o.importedObject!.item.type ?? '',
        name: o.importedObject!.item.name,
        attributes: o.importedObject!.item.attributes.map(a => ({name: a.metaName, value: a.value})),
        edited: !!o.editObject && !!o.importedObject!.item.groupId,
        created: !!o.createObject,
    }));
    // this.store.dispatch(StoreActions.setSuceededRows({entries}));
    const relationOperations = succeededOperations.filter(o => o.createRelations.length > 0);
    const relationsEntries: SucceededRelations[] = [];
    if (relationOperations.length > 0) {
      const relationCreationOperations: Promise<RelationOperation>[] = [];
      relationOperations.forEach(op => {
          op.createRelations.forEach(cr => {
              relationCreationOperations.push(
                firstValueFrom(this.createRelation(idToUrl(op.importedObject!.item.id), cr.direction, cr.relationClass, cr.relationTargetId).pipe(
                  map(operationResult => ({rowOperation: op, operationResult})),
                  catchError((error: HttpErrorResponse) => {
                      return of({rowOperation: op, operationError: error});
                  })
              )));
          });
      });
      const finishedRelationOperations = await Promise.all(relationCreationOperations);
      errors.push(...finishedRelationOperations.filter(o => !!o.operationError).map(o => ({
          row: o.rowOperation.rowNumber,
          msg: o.operationError!.status === 403 ? 'Keine Schreibrechte' : o.operationError!.message
      })));
      const succeededRelationOperations = finishedRelationOperations.filter(o => !o.operationError);
      relationsEntries.push(...succeededRelationOperations.map(o => ({
          rowNumber: o.rowOperation.rowNumber,
          fromName: o.operationResult!.from.name,
          fromClassName: o.operationResult!.from.metaName,
          toName: o.operationResult!.to.name,
          toClassName: o.operationResult!.to.metaName,
      })));
    }
    return {
      succeededOperations,
      entries,
      errors,
      relationsEntries,
    }
  }

  private createOrEditItems(rowOperations: RowOperation[]) {
    const creationAndEditAttributeOperations: Promise<RowOperation>[] = [];
    rowOperations.forEach(op => {
      if (op.createObject) {
        creationAndEditAttributeOperations.push(
          firstValueFrom(this.createObject(op.createObject).pipe(
            map(importedObject => ({ ...op, importedObject })),
            catchError((error: HttpErrorResponse) => of({ ...op, error }))
          ))
        );
      } else {
        // if edited object has no attributes but only relations, we must prepare a dummy response
        if (op.editObject!.attributes.length === 0) {
          const importedObject: CreateObjectResponse = {
            locale: 'de',
            item: op.editObject!
          };
          creationAndEditAttributeOperations.push(new Promise(resolve => resolve({ ...op, importedObject })));
        } else {
          creationAndEditAttributeOperations.push(
            firstValueFrom(this.editObject(op.editObject!, op.editObjectId!).pipe(
              map(importedObject => ({ ...op, importedObject })),
              catchError((error: HttpErrorResponse) => of({ ...op, error }))
            ))
          );
        }
      }
    });
    return creationAndEditAttributeOperations;
  }
}
