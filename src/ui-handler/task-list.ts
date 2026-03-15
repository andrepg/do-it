import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import { get_template_path } from "../utils/application.js";
import { TaskItem } from './task-item.js';

const GObjectProperties = {
  GTypeName: "TaskList",
  Template: get_template_path('ui/task-list.ui'),
  Signals: {
    'items-changed': {
      param_types: []
    }
  }
}

/**
 * A ListBox container that renders a filtered set of TaskItems.
 * 
 * Hierarchy: TaskGroup -> TaskList -> TaskItem(s)
 * 
 * This class inherits from Gtk.ListBox and is responsible for binding 
 * a GTK ListModel (typically a Gtk.FilterListModel containing Tasks 
 * for a specific project) to create and render individual TaskItem widgets.
 */
export class TaskList extends Gtk.ListBox {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  /**
   * @constructor
   * @param {Gio.ListModel} model - The list model containing ITask objects (often filtered)
   */
  constructor(model: Gio.ListModel) {
    super();

    this.bind_model(model, (item: GObject.Object) => (item as TaskItem).to_widget());
  }
}

