import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, take, tap } from 'rxjs';
import { AdonisClassList } from '../models/adonis-rest/metadata/lists/list-class.interface';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisNoteBook } from '../models/adonis-rest/metadata/notebook.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AppSettings } from '../app-settings';
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

@Injectable({
  providedIn: 'root'
})
export class DataAccess {
  constructor(private http: HttpClient) { }
  private get baseUrl() { return AppSettings.Url };

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

  private _repoId: string = '';

  set repoId(value: string) {
    this._repoId = value;
  };

  get repoId() {
    return this._repoId.substring(1, this._repoId.length - 1);
  }

  retrieveClassesWithNotebooks = () => this.retrieveClasslist().pipe(
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

  private retrieveClassDetails = (classes: AdonisBasicClass[]) => {
    const classDetails = classes.map(c => {
      const classUrl = c.rest_links.find(l => l.rel === 'self')!.href;
      return this.getUrl<AdonisClass>(classUrl);
    });
    return forkJoin(classDetails);
  };

  private filterChildren = (p: AttributeOrRelation) => p.properties.READONLY !== 'true' && p.ctrlType !== 'RECORD' && p.ctrlType !== 'FILE_POINTER';
  private filterChapterChildren = (p: AttributeOrGroupOrRelation) => p.type === 'GROUP' || this.filterChildren(p as AttributeOrRelation);

  retrieveNotebooksForClasses = (classes: AdonisClass[]) => {
    const notebooks = classes.map(c => {
      const notebookUrl = c.rest_links.find(l => l.rel === 'notebook')!.href;
      return this.getUrl<AdonisNoteBook>(notebookUrl).pipe(
        map(n => {
          const groups = n.chapters.map(ch => ch.children.filter(chi => chi.type === 'GROUP')).flat() as AdonisNotebookGroup[];
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
      const attributesUrl = c.rest_links.find(l => l.rel === 'attributes')!.href;
      return this.getUrl<AdonisAttributeList>(attributesUrl).pipe(
        map(al => {
          const attributeIds = al.attributes.map(a => a.id);
          const attributeUrl = al.attributes.map(a => a.rest_links.find(l => l.rel === 'self')!.href);
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

  retrieveRepositories = () => this.getUrl<AdonisRepoList>(this.baseUrl + Constants.repos_url);

  retrieveObjectGroupStructure = () => this.getUrl<AdonisGroupContainer>(this.baseUrl + Constants.repos_url + this.repoId + Constants.objectgroups_url);

  searchObjects = (queryString: string) => this.getUrl<AdonisSearchResult>(this.baseUrl + Constants.repos_url + this.repoId + Constants.search_query_url + queryString);

  createObject = (newObject: CreateObject) => this.postUrl<CreateObjectResponse>(this.baseUrl + Constants.repos_url + this.repoId + Constants.objects_url, newObject);
  
  editObject = (existingObject: EditObject, id: string) => this.patchUrl<CreateObjectResponse>(this.baseUrl + Constants.repos_url + this.repoId + Constants.objects_url + '/' + id, existingObject);
}
