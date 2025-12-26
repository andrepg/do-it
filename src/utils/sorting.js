import { SortingStrategy, SortingModeSchema, SortingModes } from "../static.js";
import { get_setting_string, set_setting_string } from "./application.js";
import { log } from "./log-manager.js"

function makeComparator(extractors, strategy) {
    const asc = strategy === SortingStrategy.ASCENDING;

    return (a, b, _data) => {
        for (const extractor of extractors) {
            const av = extractor(a);
            const bv = extractor(b);

            if (av === bv) continue;
            return av > bv ? (asc ? 1 : -1) : (asc ? -1 : 1);
        }
        return 0;
    };
}

/**
 * Sort tasks by their creation date.
 * 
 * @param {string} strategy Which type of strategy to use {from SortingStrategy enum}
 */
function sortByCreationDate(strategy = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by creation date in ${strategy} order.`)

    return makeComparator([item => item._created_at], strategy);
}

/**
 * Sort tasks by their Finished/Done status
 * 
 * @param {string} strategy Which type of strategy to use {from SortingStrategy enum}
 */
function sortByDoneStatus(strategy = SortingStrategy.ASCENDING) {
    const notDoneFirst = strategy == SortingStrategy.ASCENDING;

    log("sorting", `Sorting by status (not done first: ${notDoneFirst}).`)

    return makeComparator([
        item => item._deleted_at ? 2 : item.get_done() ? 1 : 0,
    ], strategy);
}

/**
 * Sort tasks by their title, alphabetically.
 * 
 * @param {string} strategy Which type of strategy to use {from SortingStrategy enum}
 */
function sortByTitle(strategy = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by title in ${strategy} order.`)

    return makeComparator([
        item => String(item.get_text()).toLowerCase(),
    ], strategy);
}

export function get_sorting_algorithm() {
    const sort_mode = get_setting_string(SortingModeSchema.MODE);
    const sort_strategy = get_setting_string(SortingModeSchema.STRATEGY);

    switch (sort_mode) {
        case SortingModes.BY_DATE:
            return sortByCreationDate(sort_strategy);
        case SortingModes.BY_STATUS:
            return sortByDoneStatus(sort_strategy);
        case SortingModes.BY_TITLE:
            return sortByTitle(sort_strategy);
        default:
            log("sorting", `Unknown sorting mode: ${sort_mode}. Defaulting to BY_DATE.`);
            return sortByCreationDate(sort_strategy);
    }
}

export function set_sorting_algorithm(sorting_mode) {
    // First we get last known values to further logic
    const last_sorting_mode = get_setting_string(SortingModeSchema.MODE);
    const last_sorting_strategy = get_setting_string(SortingModeSchema.STRATEGY);

    // Then we set our mode to current and strategy to ASCENDING by default
    set_setting_string(SortingModeSchema.MODE, sorting_mode);
    set_setting_string(SortingModeSchema.STRATEGY, SortingStrategy.ASCENDING);

    // If the user is just changing current strategy, we must act accordingly
    if (sorting_mode == last_sorting_mode) {
        const isAscending = last_sorting_strategy == SortingStrategy.ASCENDING;

        const new_sorting_strategy = isAscending ? SortingStrategy.DESCENDING : SortingStrategy.ASCENDING;

        set_setting_string(SortingModeSchema.STRATEGY, new_sorting_strategy);
    }
}