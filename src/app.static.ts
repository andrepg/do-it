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
    mode: SortingField.byDate,
  },
  {
    label: _("Project"),
    mode: SortingField.byProject,
  },
  {
    label: _("Status"),
    mode: SortingField.byStatus,
  },
  {
    label: _("Title"),
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