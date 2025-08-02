import { AdonisClass } from "./adonis-class.interface"
import { AdonisNoteBook } from "./adonis-notebook.interface";

export interface ClassContainer {
    [key: string]: ClassInformation;
};

export interface ClassInformation {
    class: AdonisClass;
    notebook: AdonisNoteBook;
}