import { SortingField, SortingModeSchema, SortingStrategy } from "../app.enums.js";
import { TaskItem } from "../ui-handler/task-item.js";
import { get_setting_int, get_setting_string, set_setting_int, set_setting_string } from "../utils/settings.js";

interface IExtractorFunction {
    <T>(item: T): unknown;
}

export const useTaskSort = () => {
    let current_sort_mode: SortingField = SortingField.byTitle;

    let current_sort_strategy: SortingStrategy = SortingStrategy.ascending;

    const create_comparator = <T>(extractors: IExtractorFunction[], strategy: SortingStrategy) => {
        const isAscending = strategy === SortingStrategy.ascending;

        const compare_numeric = (a: number, b: number) => a - b;
        const compare_string = (a: string, b: string) => a.localeCompare(b);

        return (a: T, b: T) => {
            for (const extractor of extractors) {
                const value_of_a = extractor(a);
                const value_of_b = extractor(b);

                if (value_of_a === value_of_b) continue;

                const direction = isAscending ? 1 : -1;

                const ordering = typeof value_of_a === "string" && typeof value_of_b === "string"
                    ? compare_string(value_of_a, value_of_b)
                    : compare_numeric(value_of_a as number, value_of_b as number);

                return ordering * direction;
            }

            return 0;
        }
    }

    const sort_by_date = (strategy: SortingStrategy) => {
        return create_comparator([(item) => (item as TaskItem).to_object().created_at.valueOf()], strategy);
    }

    const sort_by_status = (strategy: SortingStrategy) => {
        return create_comparator([(item) => (item as TaskItem).to_object().done ? 1 : 0], strategy);
    }

    const sort_by_title = (strategy: SortingStrategy) => {
        return create_comparator([(item) => (item as TaskItem).to_object().title], strategy);
    }

    const sort_by_project_name = (strategy: SortingStrategy) => {
        return (a: string, b: string) => {
            if (a === "") return -1;
            if (b === "") return 1;

            const isAscending = strategy === SortingStrategy.ascending;
            const comparison = a.localeCompare(b);

            return isAscending ? comparison : -comparison;
        }
    }

    const sort_by_project = (strategy: SortingStrategy) => {
        return (a: TaskItem, b: TaskItem) => {
            const project_a = a.to_object().project || "";
            const project_b = b.to_object().project || "";
            return sort_by_project_name(strategy)(project_a, project_b);
        }
    }

    const sort_by = (field: SortingField, strategy: SortingStrategy) => {
        current_sort_mode = field;
        current_sort_strategy = strategy;

        switch (field) {
            case SortingField.byDate:
                return sort_by_date(strategy);
            case SortingField.byStatus:
                return sort_by_status(strategy);
            case SortingField.byTitle:
                return sort_by_title(strategy);
            case SortingField.byProject:
                return sort_by_project(strategy);
            default:
                return sort_by_date(strategy);
        }
    }

    const persist_sort_preferences = () => {
        set_setting_string(SortingModeSchema.MODE, current_sort_mode);
        set_setting_int(SortingModeSchema.STRATEGY, current_sort_strategy);
    }

    const retrieve_sort_preferences = () => {
        current_sort_mode = get_setting_string(SortingModeSchema.MODE) as SortingField;
        current_sort_strategy = get_setting_int(SortingModeSchema.STRATEGY) as SortingStrategy;

        return {
            mode: current_sort_mode,
            strategy: current_sort_strategy
        };
    }

    return {
        sort_by,
        sort_by_date,
        sort_by_status,
        sort_by_title,
        sort_by_project,
        sort_by_project_name,

        persist_sort_preferences,
        retrieve_sort_preferences,
    }
}
