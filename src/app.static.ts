import { SortingField, SortingStrategy } from "./app.enums.js"
import { ISortingFieldOption, ISortingStrategyOption } from "./app.types.js"

pkg.initGettext();

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

export const TaskDeleteButtonIcon = {
  default: "user-trash-symbolic",
  deleted: "edit-undo-symbolic"
}

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