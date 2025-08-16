import { AdonisRestObject } from "../basic-type.interface";
import { AdonisRepository } from "../repository.interface";

export interface AdonisRepoList extends AdonisRestObject {
    repos: AdonisRepository[];
}
