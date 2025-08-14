import { AdonisNoteBook } from "./adonis-notebook.interface";

export interface NotebookContainer {
    [key: string]: AdonisNoteBook;
}