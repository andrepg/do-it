const { GObject, Gtk, Adw } = imports.gi;

export const TaskList = GObject.registerClass(
  {
    GTypeName: "TaskList",
    Template: "resource:///io/github/andrepg/Doit/ui/task-list.ui",
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
  _init() {
    super._init();

    console.log(`[task-list] Initializing task list`);
  }

  get_list() {
    return this.list_store;
  }

  bind(store) {
    this._task_listbox.bind_model(
      store, item => item.to_widget()
    )
  }
  
  get_count() {
    return this.list_store.get_count();
  }
});

export const CreateTaskList = (listStore) => {
  const _task_list = new TaskList();

  _task_list.bind(listStore)

  let _list_clamp = new Adw.Clamp();

  _list_clamp.set_maximum_size(960);

  _list_clamp.set_child(_task_list);

  return _list_clamp;
}
