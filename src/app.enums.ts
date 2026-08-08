export enum AppSignals {
  Apply = 'apply',
  Clicked = 'clicked',
  Toggled = 'toggled',
  NotifyActive = 'notify::active',
  Activate = 'activate',
  Activated = 'activated',
  EntryActivated = 'entry-activated',
  ItemsChanged = 'items-changed',
  ProjectAdded = 'project-added',
  ProjectRemoved = 'project-removed',
  FilterChanged = 'filter-changed',
  SortingChanged = 'sorting-changed',
  TaskUpdated = 'task-updated',
  TaskDeleted = 'task-deleted',
  TaskFormClosed = 'task-form-closed',
}

export enum CssClasses {
  SuggestedAction = 'suggested-action',
  Devel = 'devel',
}

export enum WidgetIds {
  WindowSplitView = 'split_view',
  WindowListContainer = 'list_container',
  WindowListEmpty = 'list_empty',
  WindowListStack = 'list_stack',
  WindowToastOverlay = 'toast_overlay',
  WindowSidebarProjectList = 'sidebar_project_list',
  WindowButtonNewTask = 'button_new_task',
  WindowTaskNewEntry = 'task_new_entry',
  WindowButtonSorting = 'button_sorting',
  PopoverSortToggleGroupSortField = 'toggle-group-sort-field',
  PopoverSortToggleGroupSortStrategy = 'toggle-group-sort-strategy',
  PopoverSortLabelStrategy = 'label_strategy',
  TaskItemTaskDone = 'task_done',
  TaskItemTaskDelete = 'task_delete',
  TaskFormEntryTitle = 'task_form_entry_title',
  TaskFormEntryProject = 'task_form_entry_project',
  TaskFormCheckDone = 'task_form_check_done',
  TaskFormBtnDelete = 'task_form_btn_delete',
  TaskFormBtnSave = 'task_form_btn_save',
  TaskFormBtnDiscard = 'task_form_btn_discard',
  WindowBottomSheet = 'window_bottom_sheet',
  WindowBottomSheetContent = 'window_bottom_sheet_content',
  TaskFormWidget = 'task_form',
}

export enum SortingField {
  byDate = 'by_date',
  byStatus = 'by_status',
  byTitle = 'by_title',
  byProject = 'by_project',
}

export enum SortingStrategy {
  ascending = 'ascending',
  descending = 'descending',
}
