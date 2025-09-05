export const idToUrl = (id: string) => {
    if (id.startsWith('{') && id.endsWith('}')) {
        return id.substring(1, id.length - 1);
    }
    return id;
};