export const EntryRowSettings = {
  enabled: {
    opacity: 1,
    editable: true,
    markup: '%s',
  },
  disabled: {
    opacity: 0.5,
    editable: false,
    markup: '<s>%s</s>'
  }
}

export const TASK_DELETE_ICON = {
  default: "user-trash-symbolic",
  deleted: "rotation-allowed-symbolic"
}

/**
 * The SortingModeSchema holds our Schema Settings key to store
 * last preferred sort mode and strategy used
 */
export const SortingModeSchema = Object.freeze({
    STRATEGY: 'last-sorting-strategy',
    MODE: 'last-sorting-mode',
});

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

