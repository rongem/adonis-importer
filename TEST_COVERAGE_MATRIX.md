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
| Data access | src/app/lib/data-access/data-access.spec.ts | Retry, no-retry, dedup, queue continuity, class filtering covered | High | No direct assertions for notebook/attribute retrieval transformation edge cases |
| Guards | src/app/lib/guards/*.spec.ts | Positive/negative route gating covered, side effect in choose-repository guard covered | High | Minimal residual risk |
| Auth interceptor | src/app/lib/interceptors/auth-interceptor.spec.ts | Connection bypass + auth header injection covered | High | Minimal residual risk |
| Class list | src/app/classes/class-list/class-list.spec.ts | Render list, click delegation, disabled state covered | Medium | No explicit title/infoText assertions |
| Class content | src/app/classes/class-content/class-content.spec.ts | Selection build logic, relation target extraction, reset, action delegation covered | High | No deep template-level selection rendering assertions |
| Children tree | src/app/classes/children/children.spec.ts | Node traversal, control helpers, relation group enable/disable covered | Medium | Recursive template rendering and nested interaction not deeply asserted |
| Child relation | src/app/classes/child-relation/child-relation.spec.ts | Creation only | Low | Required-input wiring and target checkbox rendering are untested |
| Export files | src/app/classes/export-files/export-files.spec.ts | Init generation flow and clipboard copy covered | Medium | XLSX side effects are environment-limited (jsdom navigation warning) |
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
