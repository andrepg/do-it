const { GObject, Gtk, Adw } = imports.gi;

export const TaskList = GObject.registerClass(
  {
    GTypeName: "TaskList",
    Template: "resource:///io/github/andrepg/Doit/ui/task-list.ui",
    Signals: {
      'items-changed': {
        param_types: []
      }
    }
  }, class TaskList extends Gtk.ListBox {
  _init() {
    super._init();

    console.log('[task-list] Initializing task list');
  }

  bind(store) {
    this.bind_model(
      store, item => item.to_widget()
    )
  }
});

export const CreateTaskList = (listStore) => {
  const _task_list = new TaskList();

  _task_list.bind(listStore)

  const builder = Gtk.Builder.new_from_resource('/io/github/andrepg/Doit/ui/empty_tasks.ui')
  const placeholder = builder.get_object('ListEmptyBox');

  _task_list.set_placeholder(placeholder)

  return _task_list;
}
