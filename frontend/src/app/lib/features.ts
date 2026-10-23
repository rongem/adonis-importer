// Features that are implemented, but switched off until the ADONIS REST API provides what they need.
export const features = {
    // direct import of objects from the clipboard: the API cannot tell whether an object group
    // is writable, and its error messages do not explain why writing failed
    objectImport: false,
    // import of relations (requires objectImport): the API does not provide cardinalities
    relationImport: false,
};
