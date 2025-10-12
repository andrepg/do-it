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
  /**
  * Holds our List Store and persistence settings
  * @type {TaskListStore}
  * @private
  */
  _list_store;

  _init(title = "", subtitle = "") {
    super._init();

    console.log(`[task-list] Initializing task list ${title}`);

    this._setup_list_store()
    this._set_visibility()

    this._task_list_title.set_title(title);
    this._task_list_title.set_subtitle(subtitle);
  }

  get_list() {
    return this._list_store;
  }

  _setup_list_store() {
    console.log(`[task-list] Initializing list store`);
    this._list_store = new TaskListStore({ type: Task });

    console.log(`[task-list] Binding task model and list box`);
    this._task_listbox.bind_model(this._list_store, (task) =>
      task.to_widget(),
    );

    this._list_store.load()
  }

  _set_visibility() {
    this.set_visible(this._list_store.get_count() > 0);
    console.log(`[task-list] Set visibility to ${this.get_visible()}`);
  }

  add_task(task) {
    console.log(`[task-list] Adding task ${task.title}`);

    const taskObj = new Task(
      this._list_store.get_count() + 1,
      task.title,
      task.done || false,
      task.deleted || false,
    );

    taskObj.connect("task-updated", this._process_task_updated.bind(this));
    taskObj.connect("task-deleted", this._process_task_deleted.bind(this));


    this._list_store.append(taskObj);

    if (!this.get_visible()) {
      this._set_visibility();
    }
  }

  set_title(title) {
    this._task_list_title.set_title(title)
  }

  get_count() {
    return this._list_store.get_count();
  }

  _process_task_updated() {
    console.log('[task-list] Receiving task-updated signal')

    this._list_store.persist()

    this.emit("items-changed")
  }

  _process_task_deleted(task) {
    console.info('[task-list] Receiving task-deleted signal')

    this._list_store.persist()

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
