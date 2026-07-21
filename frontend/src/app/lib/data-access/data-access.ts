import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, catchError, finalize, forkJoin, map, mergeMap, Observable, of, ReplaySubject, retry, shareReplay, Subject, take, tap, timer } from 'rxjs';
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
import { idToUrl } from '../helpers/url.functions';
import { AdonisItem } from '../models/adonis-rest/read/item.interface';

@Injectable({
  providedIn: 'root'
})
export class DataAccess {
  private readonly http = inject(HttpClient);
  private readonly maxConcurrentRequests = 20;
  private readonly readRetryCount = 0;
  private readonly requestQueue = new Subject<QueuedRequest<unknown>>();
  private readonly inflightReadRequests = new Map<string, Observable<unknown>>();

  constructor() {
    this.requestQueue.pipe(
      mergeMap(request => this.executeQueuedRequest(request), this.maxConcurrentRequests),
    ).subscribe();
  }

  private retrieveClasslist = (baseUrl: string) => this.getUrl<AdonisClassList>(baseUrl + '4.0/metamodel/classes');

  private executeQueuedRequest = (queuedRequest: QueuedRequest<unknown>) => {
    const source$ = queuedRequest.createRequest();
    const request$ = queuedRequest.isReadRequest
      ? source$.pipe(
          retry({
            count: this.readRetryCount,
            delay: (_error, retryAttempt) => timer(this.retryDelay(retryAttempt)),
          }),
        )
      : source$;

    return request$.pipe(
      tap({
        next: value => queuedRequest.response$.next(value),
        error: error => queuedRequest.response$.error(error),
        complete: () => queuedRequest.response$.complete(),
      }),
      mergeMap(() => of(void 0)),
      // Keep queue processing alive after request failures.
      catchError(() => EMPTY),
    );
  };

  private retryDelay = (retryAttempt: number) => {
    const baseDelayInMs = Math.min(250 * 2 ** (retryAttempt - 1), 1500);
    const jitterInMs = Math.floor(Math.random() * 150);
    return baseDelayInMs + jitterInMs;
  };

  private queueRequest<T>(createRequest: () => Observable<T>, isReadRequest: boolean): Observable<T> {
    const response$ = new ReplaySubject<T>(1);
    this.requestQueue.next({
      createRequest: createRequest as () => Observable<unknown>,
      isReadRequest,
      response$: response$ as ReplaySubject<unknown>,
    });
    return response$.asObservable();
  }

  private getUrl<T>(url: string): Observable<T> {
    const inflightRequest = this.inflightReadRequests.get(url) as Observable<T> | undefined;
    if (inflightRequest) {
      return inflightRequest;
    }

    const request$ = this.queueRequest(() => this.http.get<T>(url).pipe(take(1)), true).pipe(
      finalize(() => {
        this.inflightReadRequests.delete(url);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.inflightReadRequests.set(url, request$ as Observable<unknown>);
    return request$;
  }

  private postUrl<T>(url: string, body: any): Observable<T> {
    return this.queueRequest(() => this.http.post<T>(url, body).pipe(take(1)), false);
  }

  private patchUrl<T>(url: string, body: any): Observable<T> {
    return this.queueRequest(() => this.http.patch<T>(url, body).pipe(take(1)), false);
  }

  retrieveClassesWithNotebooks = (baseUrl: string) => {
    return this.retrieveClasslist(baseUrl).pipe(
      map(m => {
        const forbiddenNames = ['C_COMMENT_ACTION', 'C_EXTERNAL_CONFIGURATION', 'CLOUD_REPOSITORY', 'C_CLOUD_TASK', 'REPOSITORY'];
        return m.classes.filter(c => c.abstract === false && c.repositoryClass === true && !c.metaName.startsWith('C_UML') && !forbiddenNames.includes(c.metaName));
      }),
      mergeMap(classes => this.retrieveClassDetails(classes)),
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

  retrieveNotebooksForClasses = (classes: AdonisClass[], purpose: 'config' | 'import') => {
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
            if (purpose === 'import') { // remove relations for import purpose, because it will be too complex to handle them
              g.children = g.children.filter(c => c.ctrlType !== Constants.RELATIONS);
            }
          })
          n.chapters.forEach(ch => {
            ch.children = ch.children.filter(this.filterChapterChildren)
            if (purpose === 'import') { // remove relations for import purpose, because it will be too complex to handle them
              ch.children = ch.children.filter(c => c.type === Constants.GROUP || (c as AttributeOrRelation).ctrlType !== Constants.RELATIONS);
            }
          });
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

  private repoUrl(baseUrl: string, repoId: string) {
    return baseUrl + Constants.repos_url + idToUrl(repoId);
  }

  retrieveRepositories = (baseUrl: string) => this.getUrl<AdonisRepoList>(baseUrl + Constants.repos_url);

  retrieveObjectGroupStructure = (baseUrl: string, repoId: string) => this.getUrl<AdonisGroupContainer>(this.repoUrl(baseUrl, repoId) + Constants.objectgroups_url);

  searchObjects = (baseUrl: string, repoId: string, queryString: string) => this.getUrl<AdonisSearchResult>(this.repoUrl(baseUrl, repoId) + Constants.search_query_url + queryString);

  retrieveSearchObjects = (baseUrl: string, repoId: string, queryString: string) => this.searchObjects(baseUrl, repoId, queryString).pipe(
    mergeMap(result => {
      const objectDetails = result.items.map(i => this.getUrl<AdonisItem>(i.rest_links.find(l => l.rel === Constants.self)!.href));
      if (objectDetails.length === 0) {
        return of([]);
      }
      return forkJoin(objectDetails);
    }),
  );

  createObject = (baseUrl: string, repoId: string, newObject: CreateObject) => this.postUrl<CreateObjectResponse>(this.repoUrl(baseUrl, repoId) + Constants.objects_url, newObject);
  
  editObject = (baseUrl: string, repoId: string, existingObject: EditObject, id: string) => this.patchUrl<CreateObjectResponse>(this.repoUrl(baseUrl, repoId) + Constants.objects_url + '/' + idToUrl(id), existingObject);

}

interface QueuedRequest<T> {
  createRequest: () => Observable<T>;
  isReadRequest: boolean;
  response$: ReplaySubject<T>;
}
