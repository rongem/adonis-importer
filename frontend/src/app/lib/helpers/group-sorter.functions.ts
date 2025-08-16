import { AdonisGroup, AdonisGroupContainer } from "../models/adonis-rest/metadata/group.interface";

export const sortGroup = (objectGroupList: AdonisGroupContainer) => {
    if (objectGroupList.group.subgroups && objectGroupList.group.subgroups.length > 0) {
        objectGroupList.group.subgroups = sortSubGroups(objectGroupList.group.subgroups);
    }
    return objectGroupList;
}

const sortSubGroups = (groups: AdonisGroup[]) => {
    groups.forEach(g => {
        if (g.subgroups && g.subgroups.length > 0) {
            g.subgroups = sortSubGroups(g.subgroups);
        }
    });
    groups = groups.sort((a, b) => a.name > b.name ? 1 : -1);
    return groups;
}