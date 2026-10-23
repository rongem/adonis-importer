// German browser language: numbers use "," as decimal separator, dates are written as dd.mm.yyyy
export function usesGermanFormat() {
    return /^de\b/.test(navigator.language);
}
