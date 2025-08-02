import { AdonisClass } from "./adonis-class.interface"
import { AdonisNoteBook } from "./adonis-notebook.interface";

export interface ClassContainer {
    [key: string]: AdonisClass;
};