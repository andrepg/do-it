/* popover-sort.ts
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
import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import Adw1 from 'gi://Adw';

import { get_template_path } from '../utils/application.js';
import { SortingFieldOptions, SortingModeOptions } from '../app.static.js';
import { ISortingFieldOption, ISortingStrategyOption } from '../app.types.js';

import { useTaskSort } from '../hooks/tasks.sort.js';
import { AppSignals, SortingField, SortingStrategy, WidgetIds } from '../app.enums.js';
import { AppLocale } from '../app.strings.js';

const GObjectProperties = {
  GTypeName: 'PopoverSort',
  Template: get_template_path('ui/popover-sort.ui'),
  InternalChildren: [
    WidgetIds.PopoverSortToggleGroupSortField,
    WidgetIds.PopoverSortToggleGroupSortStrategy,
    WidgetIds.PopoverSortLabelStrategy,
  ],
};

/**
 * Handler for the sorting popover UI.
 * Populates sorting fields and strategies dynamically from app.static.ts.
 */
export class PopoverSort extends Gtk40.Popover {
  private _task_sort = useTaskSort();

  private toggle_group_sort_field!: Adw1.ToggleGroup;

  private toggle_group_sort_strategy!: Adw1.ToggleGroup;

  private label_strategy!: Gtk40.Label;

  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor(private window: Gtk40.Window) {
    super();

    this.toggle_group_sort_field = this.get_template_child(
      PopoverSort.$gtype,
      WidgetIds.PopoverSortToggleGroupSortField,
    ) as Adw1.ToggleGroup;
    this.toggle_group_sort_strategy = this.get_template_child(
      PopoverSort.$gtype,
      WidgetIds.PopoverSortToggleGroupSortStrategy,
    ) as Adw1.ToggleGroup;
    this.label_strategy = this.get_template_child(
      PopoverSort.$gtype,
      WidgetIds.PopoverSortLabelStrategy,
    ) as Gtk40.Label;

    this.initialise();

    this.update_label();

    this.toggle_group_sort_field.connect(AppSignals.NotifyActive, () => this.notify_active());
    this.toggle_group_sort_strategy.connect(AppSignals.NotifyActive, () => this.notify_active());
  }

  /**
   * Updates the strategy label to reflect the currently active sorting strategy alphabetically.
   */
  private update_label() {
    const fieldToggle = this.get_current_field_toggle();
    const strategyToggle = this.get_current_strategy_toggle();

    const field = fieldToggle?.get_name() as SortingField;
    const strategy = Number.parseInt(strategyToggle?.get_name() || '0') as SortingStrategy;

    const strategyName = AppLocale.sorting[strategy][field];
    this.label_strategy.set_label(strategyName);
  }

  /**
   * Retrieves the active Adw1.Toggle representing the selected sorting field.
   */
  private get_current_field_toggle() {
    return this.toggle_group_sort_field.get_toggle(this.toggle_group_sort_field.get_active());
  }

  /**
   * Retrieves the active Adw1.Toggle representing the selected sorting strategy.
   */
  private get_current_strategy_toggle() {
    return this.toggle_group_sort_strategy.get_toggle(this.toggle_group_sort_strategy.get_active());
  }

  /**
   * Callback activated when any toggle button changes its state.
   * Reads the current selections, applies sorting to the taskStore via useTaskSort hook,
   * persists the settings, and emits a signal to update the main window's task list.
   */
  private notify_active() {
    const fieldToggle = this.get_current_field_toggle();
    const strategyToggle = this.get_current_strategy_toggle();

    const fieldName = fieldToggle?.get_name() as SortingField;
    const strategy = Number.parseInt(strategyToggle?.get_name() || '0') as SortingStrategy;

    this._task_sort.sort_by(fieldName, strategy);
    this._task_sort.persist_sort_preferences();

    this.update_label();

    this.window.emit(AppSignals.SortingChanged);
  }

  /**
   * Initialises the popover by populating the toggle groups with sorting options.
   */
  private initialise() {
    const prefs = this._task_sort.retrieve_sort_preferences();

    SortingFieldOptions.forEach((option: ISortingFieldOption, index: number) => {
      const toggle = new Adw1.Toggle({
        label: AppLocale.sorting.fields[option.mode],
        name: option.mode.toString(),
      });

      this.toggle_group_sort_field.add(toggle);

      if (option.mode === prefs.mode) {
        this.toggle_group_sort_field.set_active(index);
      }
    });

    SortingModeOptions.forEach((option: ISortingStrategyOption, index: number) => {
      const toggle = new Adw1.Toggle({
        iconName: option.icon,
        name: option.strategy.toString(),
      });

      this.toggle_group_sort_strategy.add(toggle);

      if (option.strategy === prefs.strategy) {
        this.toggle_group_sort_strategy.set_active(index);
      }
    });
  }
}
