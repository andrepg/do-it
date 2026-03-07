import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { APPLICATION_RES, get_template_path } from "../utils/application.js";
import { TaskListStore } from '../utils/list-store.js';

import type { Task } from "./task.js";

const GObjectProperties = {
  GTypeName: "TaskList",
  Template: get_template_path('ui/task-list.ui'),
  Signals: {
    'items-changed': {
      param_types: []
    }
  }
}

export class TaskList extends Gtk.ListBox {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  taskListStore: TaskListStore;

  constructor() {
    super();

    this.taskListStore = new TaskListStore();
    this.taskListStore.load();

    this.bind_model(this.taskListStore,
      (item: GObject.Object) => (item as Task).to_widget()
    )

    const builder = Gtk.Builder.new_from_resource(`${APPLICATION_RES}/ui/empty-list.ui`)

    this.set_placeholder(
      builder.get_object('ListEmptyBox') as Gtk.Widget
    )
  }
}

