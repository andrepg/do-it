import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import Adw1 from 'gi://Adw';

import { get_template_path } from '../utils/application.js';
import { SortingFieldOptions, SortingModeOptions } from '../app.static.js';
import { ISortingFieldOption, ISortingStrategyOption } from '../app.types.js';

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

  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor() {
    super();

    this.initialise();
  }

  /**
   * Initialises the popover by populating the toggle groups with sorting options.
   */
  private initialise() {
    const toggle_group_sort_field = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-field') as Adw1.ToggleGroup;
    const toggle_group_sort_strategy = this.get_template_child(PopoverSort.GType, 'toggle-group-sort-strategy') as Adw1.ToggleGroup;

    SortingFieldOptions.forEach((option: ISortingFieldOption) => {
      const toggle = new Adw1.Toggle({
        label: option.label,
      });

      toggle_group_sort_field.add(toggle);
    });

    SortingModeOptions.forEach((option: ISortingStrategyOption) => {
      const toggle = new Adw1.Toggle({
        child: new Gtk40.Image({ icon_name: option.icon }),
      });

      toggle_group_sort_strategy.add(toggle);
    });
  }
}
