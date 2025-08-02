import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, take } from 'rxjs';
import { AdonisClassList } from '../interfaces/adonis-list-class.interface';
import { AdonisClass } from '../interfaces/adonis-class.interface';
import { AdonisNoteBook } from '../interfaces/adonis-notebook.interface';
import { ClassContainer } from '../interfaces/container-class.interface';
import { AppSettings } from '../app-settings';
import { AdonisNotebookGroup } from '../interfaces/adonis-notebook-elements.interface';
import { AdonisBasicClass } from '../interfaces/adonis-basic-class.interface';
import { AdonisAttributeTypeList } from '../interfaces/adonis-list-attributetype.interface';
import { AdonisAttributeType } from '../interfaces/adonis-attributetype.interface';
import { AttributeTypeContainer } from '../interfaces/container-attributetype.interface';
import { AdonisBasicAttributeType } from '../interfaces/adonis-basic-attributetype.interface';
import { NotebookContainer } from '../interfaces/container-notebook.interface';
import { AdonisAttribute } from '../interfaces/adonis-attribute.interface';

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

  retrieveClassesWithNotebooks = () => this.retrieveClasslist().pipe(
      map(m => {
        const forbiddenNames = ['C_COMMENT_ACTION', 'C_EXTERNAL_CONFIGURATION', 'CLOUD_REPOSITORY', 'C_CLOUD_TASK', 'REPOSITORY'];
        return m.classes.filter(c => c.abstract === false && c.repositoryClass === true && !c.metaName.startsWith('C_UML') && !forbiddenNames.includes(c.metaName));
      }),
      mergeMap(this.retrieveClassDetails),
      // mergeMap(this.retrieveNotebooksForClasses),
      map(classes => {
        const classContainer: ClassContainer = {};
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
            })
          });
          return { [c.id]: n } as NotebookContainer;
        }),
      );
    });
    return forkJoin(notebooks);
  };

  retrieveAttributesForClasses = (classes: AdonisClass[]) => {
    const attributes = classes.map(c => {
      const attributesUrl = c.rest_links.find(l => l.rel === 'attributes')!.href;
      return this.getUrl<AdonisAttribute[]>(attributesUrl).pipe(
        map(p => ({ [c.id]: p })),
      );
    });
    return forkJoin(attributes);
  };

  private retrieveAttributeTypeList = () => (this.getUrl<AdonisAttributeTypeList>(this.baseUrl + '4.0/metamodel/attrtypes'));

  retrieveAttributeTypes = () => this.retrieveAttributeTypeList().pipe(
    map(attributeTypesList => attributeTypesList.attrTypes.filter(at => at.metaName !== 'PAGELAYOUT')),
    mergeMap(this.retrieveAttributeTypeDetail),
    map(attributeTypes => {
      const attributeTypesContainer: AttributeTypeContainer = {};
      attributeTypes.forEach(at => {
        attributeTypesContainer[at.id] = at;
      });
      return attributeTypesContainer;
    })
  );

  private retrieveAttributeTypeDetail = (attrTypes: AdonisBasicAttributeType[]) => {
      const attributeTypes = attrTypes.map(at => {
        const at_url = at.rest_links.find(l => l.rel === 'self')!.href;
        return this.getUrl<AdonisAttributeType>(at_url)
      });
      return forkJoin(attributeTypes);
    };
}
