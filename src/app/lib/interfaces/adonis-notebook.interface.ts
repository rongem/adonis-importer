import { AdonisLink } from "./adonis-link.interface"
import { AdonisNotebookChapter } from "./adonis-notebook-elements.interface"

export interface AdonisNoteBook {
    rest_links: AdonisLink[],
    chapters: AdonisNotebookChapter[],
}