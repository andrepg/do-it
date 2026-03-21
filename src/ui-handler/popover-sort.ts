import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import { get_template_path } from '../utils/application.js';
import Adw1 from 'gi://Adw';

const GObjectProperties = {
  GTypeName: "PopoverSort",
  Template: get_template_path('ui/popover-sort.ui'),
  InternalChildren: [
  ]
};

export class PopoverSort extends Gtk40.Popover {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor() {
    super();
  }
}
