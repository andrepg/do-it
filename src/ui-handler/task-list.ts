import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { log } from "../utils/log-manager.js";
import type { Task } from "./task.js";
import { APPLICATION_RES, get_template_path } from "../utils/application.js";

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

  _init() {
    super._init();

    log("task-list", "Initializing task list");
  }

  public bind(store: Gio.ListStore): void {
    this.bind_model(
      store, (item: GObject.Object) => (item as Task).to_widget()
    )
  }
}

export const CreateTaskList = (listStore: Gio.ListStore) => {
  const _task_list = new TaskList();

  _task_list.bind(listStore)

  const builder = Gtk.Builder.new_from_resource(`${APPLICATION_RES}/ui/empty-list.ui`)

  _task_list.set_placeholder(
    builder.get_object('ListEmptyBox') as Gtk.Widget
  )

  return _task_list;
}

