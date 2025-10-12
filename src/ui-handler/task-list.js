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
});

export const CreateTaskList = (listStore) => {
  const _task_list = new TaskList(
    "Your tasks",
    "Plan your day wisely to check them all at the end."
  );

  _task_list.bind(listStore)

  let _list_clamp = new Adw.Clamp();

  _list_clamp.set_maximum_size(960);
  _list_clamp.set_child(_task_list);

  return _list_clamp;
}
