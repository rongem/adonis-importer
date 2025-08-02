import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, take } from 'rxjs';
import { AdonisMetaModel } from '../interfaces/adonis-metamodel.interface';
import { AdonisClass } from '../interfaces/adonis-class.interface';
import { AdonisNoteBook } from '../interfaces/adonis-notebook.interface';
import { ClassContainer } from '../interfaces/class-container.interface';
import { AppSettings } from '../app-settings';
import { AdonisNotebookGroup } from '../interfaces/adonis-notebook-elements.interface';

@Injectable({
  providedIn: 'root'
})
export class DataAccess {
  constructor(private http: HttpClient) {}
  private get baseUrl() { return AppSettings.Url };

  private getClasses = () => this.getUrl<AdonisMetaModel>(this.baseUrl + '4.0/metamodel/classes');

  private getUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(take(1));
  }

  retrieveClassesWithNotebooks = () => {
    return this.getClasses().pipe(
      map(m => {
        const forbiddenNames = ['C_COMMENT_ACTION', 'C_EXTERNAL_CONFIGURATION', 'CLOUD_REPOSITORY', 'C_CLOUD_TASK', 'REPOSITORY'];
        return m.classes.filter(c => c.abstract === false && c.repositoryClass === true && !c.metaName.startsWith('C_UML') && !forbiddenNames.includes(c.metaName));
      }),
      mergeMap(classes => {
        const classDetails = classes.map(c => {
          const classUrl = c.rest_links.find(l => l.rel === 'self')!.href;
          return this.getUrl<AdonisClass>(classUrl);
        });
        return forkJoin(classDetails);
      }),
      mergeMap(classes => {
        const notebooks = classes.map(c => {
          const notebookUrl = c.rest_links.find(l => l.rel === 'notebook')!.href;
          return this.getUrl<AdonisNoteBook>(notebookUrl).pipe(
            map(n => {
              const groups = n.chapters.map(ch => ch.children.filter(chi => chi.type === 'GROUP')).flat() as AdonisNotebookGroup[];
              groups.forEach(g => { // remove duplicate values, error in ADONIS REST API
                g.children.forEach((ch, index) => {
                  if (g.children.filter(chi => chi.id === ch.id).length > 1) {
                    g.children.splice(index, 1);
                  }
                })
              })
              return { notebook: n, class: c };
            }),
          );
        });
        return forkJoin(notebooks);
      }),
      map(classInformations => {
        const classContainer: ClassContainer = {};
        classInformations.forEach(ci => {
          classContainer[ci.class.id] = ci;
        });
        return classContainer;
      }),
    )
  };
}
