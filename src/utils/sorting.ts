import { SortingStrategy, SortingModeSchema, SortingModes } from "../static.js";
import { get_setting_string, set_setting_string } from "./application.js";
import { log } from "./log-manager.js"

// Declare _ global for translation
declare function _(id: string): string;

const label_by_mode: Record<string, (strategy: string) => string> = {
    [SortingModes.BY_DATE]: (strategy) => _('Sorting by date [order %s]').format(strategy),

    [SortingModes.BY_TITLE]: (strategy) => _('Sorting by title [order %s]').format(strategy),

    [SortingModes.BY_STATUS]: (strategy) => strategy == SortingStrategy.ASCENDING
        ? _("Sorting by status [finished on bottom]")
        : _("Sorting by status [finished on top]")
}

/**
 * Creates a comparator function compatible with `Array.prototype.sort`,
 * supporting multi-level sorting (multiple keys) and configurable
 * ascending or descending order.
 */
function makeComparator<T>(extractors: ((item: T) => any)[], strategy: string) {
    const requested_ascending_order = strategy === SortingStrategy.ASCENDING;

    return (a: T, b: T) => {
        for (const extractor of extractors) {
            const value_of_a = extractor(a);
            const value_of_b = extractor(b);

            if (value_of_a === value_of_b) continue;

            const direction = requested_ascending_order ? 1 : -1;
            const ordering = value_of_a > value_of_b ? 1 : -1;

            return ordering * direction;
        }
        return 0;
    };
}

/**
 * Sort tasks by their creation date.
 */
function sortByCreationDate(strategy = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by creation date in ${strategy} order.`)

    return makeComparator([item => (item as any)._created_at], strategy);
}

/**
 * Sort tasks by their Finished/Done status
 */
function sortByDoneStatus(strategy = SortingStrategy.ASCENDING) {
    const notDoneFirst = strategy == SortingStrategy.ASCENDING;

    log("sorting", `Sorting by status (not done first: ${notDoneFirst}).`)

    return makeComparator([
        item => (item as any).get_done() ? 1 : 0,
    ], strategy);
}

/**
 * Sort tasks by their title, alphabetically.
 */
function sortByTitle(strategy = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by title in ${strategy} order.`)

    return makeComparator([
        item => String((item as any).get_text()).toLowerCase(),
    ], strategy);
}

export function get_sorting_algorithm() {
    const sort_mode = get_setting_string(SortingModeSchema.MODE);
    const sort_strategy = get_setting_string(SortingModeSchema.STRATEGY);

    switch (sort_mode) {
        case SortingModes.BY_DATE:
            return sortByCreationDate(sort_strategy as any) as any;
        case SortingModes.BY_STATUS:
            return sortByDoneStatus(sort_strategy as any) as any;
        case SortingModes.BY_TITLE:
            return sortByTitle(sort_strategy as any) as any;
        default:
            log("sorting", `Unknown sorting mode: ${sort_mode}. Defaulting to BY_DATE.`);
            return sortByCreationDate(sort_strategy as any) as any;
    }
}

export function set_sorting_algorithm(sorting_mode: string) {
    const last_sorting_mode = get_setting_string(SortingModeSchema.MODE);
    const last_sorting_strategy = get_setting_string(SortingModeSchema.STRATEGY);

    set_setting_string(SortingModeSchema.MODE, sorting_mode);
    set_setting_string(SortingModeSchema.STRATEGY, SortingStrategy.ASCENDING);

    if (sorting_mode == last_sorting_mode) {
        const isAscending = last_sorting_strategy == SortingStrategy.ASCENDING;
        const new_sorting_strategy = isAscending ? SortingStrategy.DESCENDING : SortingStrategy.ASCENDING;
        set_setting_string(SortingModeSchema.STRATEGY, new_sorting_strategy);
    }
}

export function get_sorting_label_text(current_sort_mode: string, current_sort_strategy: string) {
    return label_by_mode[current_sort_mode]?.(current_sort_strategy) ?? ""
}