/* app.static.ts
 * Copyright 2025 André Paul Grandsire
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
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