import { RowOperation } from './row-operations.model';

export type ImportPlanAction = 'create' | 'edit' | 'skip';
export type ImportSkipReason = 'unchanged';

export interface PlannedRowOperation extends RowOperation {
    action: ImportPlanAction;
    skipReason?: ImportSkipReason;
}

export interface ImportPlan {
    rows: PlannedRowOperation[];
    relationsPhase: {
        status: 'unsupported';
        reason: string;
    };
}