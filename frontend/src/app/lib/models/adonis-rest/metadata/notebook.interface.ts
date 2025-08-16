import { AdonisRestObject } from "./basic-type.interface"
import { AdonisNotebookChapter } from "./notebook-elements.interface"

export interface AdonisNoteBook extends AdonisRestObject {
    chapters: AdonisNotebookChapter[],
}