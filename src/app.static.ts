import { SortingField, SortingStrategy } from "./app.enums.js"
import { ISortingFieldOption, ISortingStrategyOption } from "./app.types.js"

pkg.initGettext();

/**
 * Styles for task entries depending on their state.
 */
export const TaskEntryStyle = {
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

/**
 * Icons used for the task delete/undo button.
 */
export const TaskDeleteButtonIcon = {
  default: "user-trash-symbolic",
  deleted: "edit-undo-symbolic"
}

/**
 * Predefined options for sorting fields available in the UI.
 */
export const SortingFieldOptions: ISortingFieldOption[] = [
  {
    label: _("Date"),
    icon: "appointment-new-symbolic",
    mode: SortingField.byDate,
  },
  {
    label: _("Project"),
    icon: "folder-symbolic",
    mode: SortingField.byProject,
  },
  {
    label: _("Status"),
    icon: "task-due-symbolic",
    mode: SortingField.byStatus,
  },
  {
    label: _("Title"),
    icon: "document-decrypt-symbolic",
    mode: SortingField.byTitle,
  },
]

/**
 * Predefined options for sorting strategies available in the UI.
 */
export const SortingModeOptions: ISortingStrategyOption[] = [
  {
    icon: "view-sort-ascending-symbolic",
    strategy: SortingStrategy.ascending,
  },
  {
    icon: "view-sort-descending-symbolic",
    strategy: SortingStrategy.descending,
  },
]