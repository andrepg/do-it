import { SortingField, SortingStrategy } from "./app.enums.js";

/**
 * Represents the current sorting configuration.
 */
export type SortingSettings = {
    mode: SortingField;
    strategy: SortingStrategy;
}

/**
 * Represents a single task entity in the application.
 */
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

/**
 * Configuration option for a sorting field in the UI.
 */
export interface ISortingFieldOption {
    label: string;
    icon?: string;
    mode: SortingField;
}

/**
 * Configuration option for a sorting strategy in the UI.
 */
export interface ISortingStrategyOption {
    icon: string;
    strategy: SortingStrategy;
}