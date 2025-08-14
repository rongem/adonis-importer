import { AdonisRestObject } from "./adonis-basic-type.interface";
import { AdonisRepository } from "./adonis-repository.interface";

export interface AdonisRepoList extends AdonisRestObject {
    repos: AdonisRepository[];
}
