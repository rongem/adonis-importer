import { AdonisRestObject } from "./adonis-basic-type.interface"
import { AdonisNotebookChapter } from "./adonis-notebook-elements.interface"

export interface AdonisNoteBook extends AdonisRestObject {
    chapters: AdonisNotebookChapter[],
}