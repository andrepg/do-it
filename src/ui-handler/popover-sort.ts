import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import Adw1 from 'gi://Adw';

import { get_template_path } from '../utils/application.js';
import { SortingFieldOptions, SortingModeOptions } from '../app.static.js';
import { ISortingFieldOption, ISortingStrategyOption } from '../app.types.js';

import { useTaskSort } from '../hooks/tasks.sort.js';
import { SortingField, SortingStrategy } from '../app.enums.js';

const GObjectProperties = {
  GTypeName: "PopoverSort",
  Template: get_template_path('ui/popover-sort.ui'),
  InternalChildren: [
    'toggle-group-sort-field',
    'toggle-group-sort-strategy'
  ]
};

/**
 * Handler for the sorting popover UI.
 * Populates sorting fields and strategies dynamically from app.static.ts.
 */
export class PopoverSort extends Gtk40.Popover {
  static readonly GType = PopoverSort as unknown as GObject.GType;

  private _task_sort = useTaskSort();

  private toggle_group_sort_field!: Adw1.ToggleGroup;

  private toggle_group_sort_strategy!: Adw1.ToggleGroup;

  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor(window: Gtk40.Window) {
    super();

    this.toggle_group_sort_field = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-field') as Adw1.ToggleGroup;
    this.toggle_group_sort_strategy = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-strategy') as Adw1.ToggleGroup;

    this.initialise(window);

    const { mode, strategy } = this._task_sort.retrieve_sort_preferences();

    this.toggle_group_sort_field.connect('notify::active', () => {
      const toggle = this.toggle_group_sort_field.get_toggle(this.toggle_group_sort_field.get_active());

      this._task_sort.sort_by(toggle?.get_name() as SortingField, strategy);
      this._task_sort.persist_sort_preferences();

      window.emit('change-sorting', {});
    });

    this.toggle_group_sort_strategy.connect('notify::active', () => {
      const toggle = this.toggle_group_sort_strategy.get_toggle(this.toggle_group_sort_strategy.get_active());

      this._task_sort.sort_by(mode, (toggle?.get_name() || 0) as SortingStrategy);
      this._task_sort.persist_sort_preferences();

      window.emit('change-sorting', {});
    });
  }

  /**
   * Initialises the popover by populating the toggle groups with sorting options.
   * @param {Gtk40.Window} window - The main window to emit signals on.
   */
  private initialise(window: Gtk40.Window) {
    const { mode, strategy } = this._task_sort.retrieve_sort_preferences();

    SortingFieldOptions.forEach((option: ISortingFieldOption) => {
      const toggle = new Adw1.Toggle({
        label: option.label,
        name: option.mode.toString()
      });

      this.toggle_group_sort_field.add(toggle);
    });

    SortingModeOptions.forEach((option: ISortingStrategyOption) => {
      const toggle = new Adw1.Toggle({
        iconName: option.icon,
        name: option.strategy.toString()
      });

      this.toggle_group_sort_strategy.add(toggle);
    });
  }
}
