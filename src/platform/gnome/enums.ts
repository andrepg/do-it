/* enums.ts
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
export enum AppSignals {
  Apply = 'apply',
  Clicked = 'clicked',
  Toggled = 'toggled',
  NotifyActive = 'notify::active',
  Activate = 'activate',
  Activated = 'activated',
  ItemsChanged = 'items-changed',
  ProjectAdded = 'project-added',
  ProjectRemoved = 'project-removed',
  FilterChanged = 'filter-changed',
  SortingChanged = 'sorting-changed',
  TaskUpdated = 'task-updated',
  TaskDeleted = 'task-deleted',
  TaskFormClosed = 'task-form-closed',
}

export enum ActionNames {
  About = 'about',
  Quit = 'quit',
  Shortcuts = 'shortcuts',
  ExportDatabase = 'export_database',
  ImportDatabase = 'import_database',
  PurgeDeletedTasks = 'purge_deleted_tasks',
  ToggleSidebar = 'toggle-sidebar',
  CollapseSidebar = 'collapse-sidebar',
  ShowToast = 'show-toast',
  TaskEdit = 'task-edit',
  TaskEditClose = 'task-edit-close',
  NewTask = 'new-task',
}

export enum CssClasses {
  SuggestedAction = 'suggested-action',
  Devel = 'devel',
}

export enum WidgetIds {
  WindowSplitView = 'split_view',
  WindowListContainer = 'list_container',
  WindowToastOverlay = 'toast_overlay',
  WindowSidebarProjectList = 'sidebar_project_list',
  WindowButtonOpenSidebar = 'button_open_sidebar',
  WindowButtonToggleSidebar = 'button_toggle_sidebar',
  WindowButtonNewTask = 'button_new_task',
  WindowTaskNewEntry = 'task_new_entry',
  WindowButtonSorting = 'button_sorting',
  PopoverSortToggleGroupSortField = 'toggle-group-sort-field',
  PopoverSortToggleGroupSortStrategy = 'toggle-group-sort-strategy',
  PopoverSortLabelStrategy = 'label_strategy',
  SidebarButtonContent = 'button_content',
  SidebarButtonIcon = 'button_icon',
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
