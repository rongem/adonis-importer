# Test Coverage Matrix (Angular 22 + Vitest)

This matrix summarizes current unit-test coverage and remaining risk hotspots.

## Legend
- Coverage: High / Medium / Low
- Risk: What can still break on Angular/framework updates without being caught early

| Area | Main files | Current test status | Coverage | Remaining risk |
|---|---|---|---|---|
| App shell | src/app/app.spec.ts | App creation + main container rendering tested | Low | Router outlet integration and global state/error rendering not explicitly asserted |
| Login flow | src/app/login/login.spec.ts | Form validity, hostname pattern, submit->workflow call tested | Medium | No test for working() state hiding form, no explicit disabled purpose option assertion |
| Metadata workflow | src/app/lib/workflows/adonis-metadata-workflow.service.spec.ts | Success and core failure paths covered | Medium | Missing detailed checks for refresh success path and notebook/attribute error branches |
| Import workflow | src/app/lib/workflows/adonis-import-workflow.service.spec.ts | Import plan (create/edit/skip, attribute diff), execution incl. per-row errors and 403 mapping, backend primary key search and preview plan covered | High | Value format sent to ADONIS (raw cell text, e.g. German dates/decimals) not verified against a real instance; missing-context path of testPrimaryInBackend leaves itemsState on Loading |
| Import table store | src/app/lib/store/import-table.service.spec.ts | Column mapping and reorder, typed rows, duplicate primary keys, enum violations, cell type errors, reset on paste covered | High | Minimal residual risk |
| Adonis store | src/app/lib/store/adonis-store.service.spec.ts | German class sorting without mutation, notebook property collection, missing notebook covered | Medium | Session context and selectProperties not asserted |
| Cell information | src/app/lib/models/table/cellinformation.model.spec.ts | German dates with and without time, invalid dates covered | Low | Number/boolean parsing and currency handling not asserted |
| Attribute comparison and columns | src/app/lib/helpers/attribute-compare.functions.spec.ts, columns.functions.spec.ts | Change detection for text/number/bool/date/enum/enum list values in different ADONIS representations; mandatory name column; enum list validation covered | High | Actual ADONIS representation of date values unknown (no writable date attribute available for testing) |
| Data access | src/app/lib/data-access/data-access.spec.ts | Retry, no-retry, dedup, queue continuity, class filtering covered | High | No direct assertions for notebook/attribute retrieval transformation edge cases |
| Guards | src/app/lib/guards/*.spec.ts | Positive/negative route gating covered, side effect in choose-repository guard covered | High | Minimal residual risk |
| Auth interceptor | src/app/lib/interceptors/auth-interceptor.spec.ts | Connection bypass + auth header injection covered | High | Minimal residual risk |
| Class list | src/app/classes/class-list/class-list.spec.ts | Render list, click delegation, disabled state covered | Medium | No explicit title/infoText assertions |
| Class content | src/app/classes/class-content/class-content.spec.ts | Selection build logic, relation target extraction, reset, action delegation covered | High | No deep template-level selection rendering assertions |
| Children tree | src/app/classes/children/children.spec.ts | Node traversal, control helpers, relation group enable/disable covered | Medium | Recursive template rendering and nested interaction not deeply asserted |
| Child relation | src/app/classes/child-relation/child-relation.spec.ts | Creation only | Low | Required-input wiring and target checkbox rendering are untested |
| Export files | src/app/classes/export-files/export-files.spec.ts | XML/XLSX link generation, object URL cleanup and clipboard copy covered | Medium | XML content itself (xml.function.ts) not yet asserted |
| XLSX generation | src/app/lib/helpers/zip.functions.spec.ts, xlsx-writer.functions.spec.ts, xlsx.functions.spec.ts | ZIP structure/CRC, well-formed package parts, typed cells, autofilter, dropdown lists, demo values per attribute type covered | High | Not opened in real Excel/LibreOffice by tests |
| Choose repository | src/app/import/choose-repository/choose-repository.spec.ts | Selection behavior + ready/not-ready + selected repo + object-group visibility covered | High | Minimal residual risk |
| Choose object group | src/app/import/choose-objectgroup/choose-objectgroup.spec.ts | Selection delegation and button rendering covered | Medium | Deep recursive tree behavior not fully asserted |
| Import table | src/app/import/import-table/import-table.spec.ts | Column title + left/right reorder + drop reorder + workflow trigger covered | High | Clipboard/paste parsing and error-message branch not yet asserted |
| Import test table | src/app/import/import-test-table/import-test-table.spec.ts | Title, button visibility, import trigger covered | Medium | Row-level badge states and existing-item branch not deeply asserted |
| Import results | src/app/import/import-results/import-results.spec.ts | Success summary, relation/error delegation, empty states covered | High | Minimal residual risk |
| Error badge | src/app/import/error-badge/error-badge.spec.ts | Click toggle, keyboard handling, focus behavior covered | High | Minimal residual risk |

## Priority backlog for next hardening step
1. Add behavior tests for src/app/classes/child-relation/child-relation.spec.ts (target rendering + checkbox binding with required inputs).
2. Add paste/error-path tests for src/app/import/import-table/import-table.spec.ts (onPaste parse success/failure and error message).
3. Add deeper notebook/attribute transformation edge tests in src/app/lib/data-access/data-access.spec.ts.
4. Add one integration-like component flow test from class selection -> property selection action branch.
