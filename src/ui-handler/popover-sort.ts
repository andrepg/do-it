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
    'toggle-group-sort-strategy',
    'label_strategy'
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

  private label_strategy!: Gtk40.Label;

  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor(private window: Gtk40.Window) {
    super();

    this.toggle_group_sort_field = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-field') as Adw1.ToggleGroup;
    this.toggle_group_sort_strategy = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-strategy') as Adw1.ToggleGroup;
    this.label_strategy = this.get_template_child(PopoverSort.GType, 'label_strategy') as Gtk40.Label;

    this.initialise();

    this.toggle_group_sort_field.connect('notify::active', () => this.notify_active());
    this.toggle_group_sort_strategy.connect('notify::active', () => this.notify_active());
  }

  private update_label() {
    const strategyToggle = this.get_current_strategy_toggle();
    const strategy = Number.parseInt(strategyToggle?.get_name() || '0') as SortingStrategy;

    this.label_strategy.set_label(SortingStrategy[strategy].toString().toLowerCase());
  }

  private get_current_field_toggle() {
    return this.toggle_group_sort_field.get_toggle(this.toggle_group_sort_field.get_active());
  }

  private get_current_strategy_toggle() {
    return this.toggle_group_sort_strategy.get_toggle(this.toggle_group_sort_strategy.get_active());
  }

  private notify_active() {
    const fieldToggle = this.get_current_field_toggle();
    const strategyToggle = this.get_current_strategy_toggle();

    const fieldName = fieldToggle?.get_name() as SortingField;
    const strategy = Number.parseInt(strategyToggle?.get_name() || '0') as SortingStrategy;

    this._task_sort.sort_by(fieldName, strategy);
    this._task_sort.persist_sort_preferences();

    this.update_label();

    this.window.emit('sorting-changed');
  }

  /**
   * Initialises the popover by populating the toggle groups with sorting options.
   */
  private initialise() {
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
