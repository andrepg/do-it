import { get_setting_string } from "./application.js";
import { log } from "./log-manager.js"

/**
 * These are the available sorting modes for the task list. 
 * Each mode defined here should correspond to an entry menu in the UI
 * 
 * The sorting modes are displayed in the [Sort] popup menu.
 * 
 * BY_DATE: Sort tasks by their creation date.
 * BY_STATUS: Sort tasks by their completion status (done or not done).
 * BY_TITLE: Sort tasks alphabetically by their title.
 */
export const SortingModes = Object.freeze({
    BY_DATE: "by-date",
    BY_STATUS: "by-status",
    BY_TITLE: "by-title",
});


/**
 * The SortingStrategy defines how we can sort each of our data types.
 * 
 * ASCENDING: Sort in ascending order (A-Z, oldest to newest, not done first).
 * DESCENDING: Sort in descending order (Z-A, newest to oldest, done first).
 */
export const SortingStrategy = Object.freeze({
    ASCENDING: "asc",
    DESCENDING: "desc",
});

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
    const sort_mode = get_setting_string('last-sorting-mode');
    const sort_strategy = get_setting_string('last-sorting-strategy');

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