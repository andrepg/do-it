/* app.enums.ts
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

/**
 * Defines the available fields by which tasks can be sorted.
 */
export enum SortingField {
  byDate = 0,
  byStatus = 1,
  byTitle = 2,
  byProject = 3,
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
};

/**
 * GSettings keys for main window application settings.
 */
export const DoItSettings = {
  windowHeight: 'window-height',
  windowWidth: 'window-width',
};

/**
 * Global signal names used throughout the project.
 */
export enum AppSignals {
  // Standard GTK/GObject interactions
  Apply = 'apply',
  Clicked = 'clicked',
  Toggled = 'toggled',
  NotifyActive = 'notify::active',
  Activate = 'activate',
  Activated = 'activated',
  ItemsChanged = 'items-changed',

  // Custom Project state signals
  ProjectAdded = 'project-added',
  ProjectRemoved = 'project-removed',
  FilterChanged = 'filter-changed',

  // Custom Task and Window states
  SortingChanged = 'sorting-changed',
  TaskUpdated = 'task-updated',
  TaskDeleted = 'task-deleted',
  TaskFormClosed = 'task-form-closed',
}

/**
 * Names of standard GIO Actions.
 */
export enum ActionNames {
  // Application wide general actions
  About = 'about',
  Quit = 'quit',
  Shortcuts = 'shortcuts',

  // Background jobs or management
  ExportDatabase = 'export_database',
  ImportDatabase = 'import_database',
  PurgeDeletedTasks = 'purge_deleted_tasks',

  // UI toggles and layout control
  ToggleSidebar = 'toggle-sidebar',
  CollapseSidebar = 'collapse-sidebar',
  ShowToast = 'show-toast',
  TaskEdit = 'task-edit',
  TaskEditClose = 'task-edit-close',
}

/**
 * Standard CSS classes used in the application.
 */
export enum CssClasses {
  SuggestedAction = 'suggested-action',
  Devel = 'devel',
}

/**
 * Common template child IDs across the application.
 */
export enum WidgetIds {
  // Main UI layouts and menus
  WindowSplitView = 'split_view',
  WindowListContainer = 'list_container',
  WindowToastOverlay = 'toast_overlay',
  WindowSidebarProjectList = 'sidebar_project_list',

  // Header bar widgets
  WindowButtonOpenSidebar = 'button_open_sidebar',
  WindowButtonToggleSidebar = 'button_toggle_sidebar',
  WindowButtonNewTask = 'button_new_task',
  WindowTaskNewEntry = 'task_new_entry',
  WindowButtonSorting = 'button_sorting',

  // Popover Sort toggle group IDs
  PopoverSortToggleGroupSortField = 'toggle-group-sort-field',
  PopoverSortToggleGroupSortStrategy = 'toggle-group-sort-strategy',
  PopoverSortLabelStrategy = 'label_strategy',

  // Sidebar button Components
  SidebarButtonContent = 'button_content',
  SidebarButtonIcon = 'button_icon',

  // Task Item components
  TaskItemTaskDone = 'task_done',
  TaskItemTaskDelete = 'task_delete',

  // Task Form components
  TaskFormEntryTitle = 'task_form_entry_title',
  TaskFormEntryProject = 'task_form_entry_project',
  TaskFormCheckDone = 'task_form_check_done',
  TaskFormBtnDelete = 'task_form_btn_delete',
  TaskFormBtnSave = 'task_form_btn_save',
  TaskFormBtnDiscard = 'task_form_btn_discard',

  // Window Bottom Sheet
  WindowBottomSheet = 'window_bottom_sheet',
  WindowBottomSheetContent = 'window_bottom_sheet_content',

  // Task Form
  TaskFormWidget = 'task_form',
}
