import { SortingField, SortingStrategy } from "./app.enums.js";

export type SortingSettings = {
    mode: SortingField;
    strategy: SortingStrategy;
}

export interface ITask {
    id?: number;
    title: string;
    created_at: number;
    project?: string;
    completed_at?: Date | null;
    tags?: string[];
    deleted?: boolean;
    done?: boolean;
}

export interface ISortingFieldOption {
    label: string;
    mode: SortingField;
}

export interface ISortingStrategyOption {
    icon: string;
    strategy: SortingStrategy;
}