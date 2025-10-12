import { TaskListStore } from "../utils/list-store.js";
import { Task } from "./task.js";

const { GObject, Gtk, Adw } = imports.gi;

const TaskListProperties = {
  title: GObject.ParamSpec.string(
    "title",
    "List title",
    "List title to show to user",
    GObject.ParamFlags.READWRITE,
    "List name",
  ),
  subtitle: GObject.ParamSpec.string(
    "subtitle",
    "List subtitle",
    "List subtitle to show to user",
    GObject.ParamFlags.READWRITE,
    "A list description",
  ),
};

export const TaskList = GObject.registerClass(
  {
    GTypeName: "TaskList",
    Template: "resource:///io/github/andrepg/Doit/ui/task-list.ui",
    Properties: TaskListProperties,
    InternalChildren: [
      'task_list_title',
      'task_listbox',
    ],
    Signals: {
      'items-changed': {
        param_types: []
      }
    }
  }, class TaskList extends Gtk.Box {
  _init(title = "", subtitle = "") {
    super._init();

    console.log(`[task-list] Initializing task list ${title}`);

    this._task_list_title.set_title(title);
    this._task_list_title.set_subtitle(subtitle);

    console.log(this.list_store)
  }

  get_list() {
    return this.list_store;
  }

  bind(store) {
    this._task_listbox.bind_model(
      store, item => item.to_widget()
    )
  }

  set_title(title) {
    this._task_list_title.set_title(title)
  }

  get_count() {
    return this.list_store.get_count();
  }

  _process_task_updated() {
    console.log('[task-list] Receiving task-updated signal')

    this.list_store.persist()

    this.emit("items-changed")
  }

  _process_task_deleted(task) {
    console.info('[task-list] Receiving task-deleted signal')

    this.list_store.persist()

    this.emit("items-changed")
  }

  _process_task_deleted(task) {
    console.log(`[toast] Setup user feedback after task deletion`);

    let toast = Adw.Toast.new(`Task ${task.title} deleted`);

    toast.set_priority(Adw.ToastPriority.ADW_TOAST_PRIORITY_HIGH);
    toast.set_button_label("Undo");
    toast.connect("button-clicked", (_) => {
      console.log(`[toast] Undo task delete - ${task.get_title()}`);
      task.set_deleted(false);
    });

    this.get_root().display_toast(toast);
  }
});
