import { ErrorList } from './errorlist.model';
import { ImportPlan } from './import-plan.model';
import { RowOperation } from './row-operations.model';
import { SucceededImports } from './succeeded-operations.model';

export interface ImportExecutionResult {
    plan: ImportPlan;
    objectPhase: {
        status: 'completed' | 'failed';
        succeededOperations: RowOperation[];
        entries: SucceededImports[];
        errors: ErrorList[];
    };
    relationsPhase: {
        status: 'unsupported';
        reason: string;
    };
}