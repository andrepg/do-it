/**
 * Defines the available fields by which tasks can be sorted.
 */
export enum SortingField {
    byDate = 'by_date',

    byStatus = 'by_status',

    byTitle = 'by_title',

    byProject = 'by_project'
}

/**
 * Defines the direction of the sorting strategy.
 */
export enum SortingStrategy {
    ascending = 0,
    descending = 1,
}

/**
 * GSettings keys for sorting mode preferences.
 */
export const SortingModeSchema = {
    MODE: 'sorting-mode',
    STRATEGY: 'sorting-strategy',
}

/**
 * GSettings keys for main window application settings.
 */
export const DoItSettings = {
    windowHeight: 'window-height',
    windowWidth: 'window-width',
}