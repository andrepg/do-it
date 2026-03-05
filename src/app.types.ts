import { SortingMode, SortingStrategy } from "./app.enums.js";

export interface SortingSettings {
    mode: SortingMode;
    strategy: SortingStrategy;
}

export interface Task {
    id: string;
    title: string;
    project: string;
    created_at: Date;
    completed_at: Date | null;
    tags: string[];
}