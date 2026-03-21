export enum SortingField {
    byDate = 'by_date',

    byStatus = 'by_status',

    byTitle = 'by_title',

    byProject = 'by_project'
}

export enum SortingStrategy {
    ascending = 0,
    descending = 1,
}

export const SortingModeSchema = {
    MODE: 'sorting-mode',
    STRATEGY: 'sorting-strategy',
}

export const DoItSettings = {
    windowHeight: 'window-height',
    windowWidth: 'window-width',
}