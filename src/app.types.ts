import { SortingMode, SortingStrategy } from "./app.enums.js";

export interface SortingSettings {
    mode: SortingMode;
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