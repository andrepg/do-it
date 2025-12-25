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
})

/**
 * Sort tasks by their creation date.
 * 
 * @param {string} mode Which type of strategy to use {from SortingStrategy enum}
 */
export function sortByCreationDate(mode = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by creation date in ${mode} order.`)

    return (item) => item._created_at;
}

/**
 * Sort tasks by their Finished/Done status
 * 
 * @param {string} mode Which type of strategy to use {from SortingStrategy enum}
 */
export function sortByDoneStatus(mode = SortingStrategy.ASCENDING) {
    const notDoneFirst = mode == SortingStrategy.ASCENDING;
    
    log("sorting", `Sorting by status (not done first: ${notDoneFirst}).`)
    
    return (item) => item.get_done() && item.get_deleted !== null
}

/**
 * Sort tasks by their title, alphabetically.
 * 
 * @param {string} mode Which type of strategy to use {from SortingStrategy enum}
 */
export function sortByTitle(mode = SortingStrategy.ASCENDING) {
    log("sorting", `Sorting by title in ${mode} order.`)

    return (item) => item.get_title();
}

export function get_sorting_algorithm(mode = SortingModes.BY_DATE, strategy = SortingStrategy.ASCENDING) {       
    switch (mode) {
        case SortingModes.BY_DATE:
            return sortByCreationDate(strategy);
        case SortingModes.BY_STATUS:
            return sortByDoneStatus(strategy);
        case SortingModes.BY_TITLE:
            return sortByTitle(strategy);
        default:
            log("sorting", `Unknown sorting mode: ${mode}. Defaulting to BY_DATE.`);
            return sortByCreationDate(strategy);
    }
}