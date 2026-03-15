import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { TaskList } from './task-list.js';
import type { TaskListStore } from '../utils/list-store.js';

const GObjectProperties = {
  GTypeName: "TaskGroup",
};

export class TaskGroup extends Adw.PreferencesGroup {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor(project: string, store: TaskListStore) {
    const groupTitle = project === "" ? "Tarefas" : project;

    super({
      title: groupTitle,
    });

    const filter = new Gtk.CustomFilter();
    filter.set_filter_func((item: GObject.Object) => {
      const task = item as any;
      const taskProject = (typeof task.get_project === 'function') ? task.get_project() : "";
      return taskProject === project;
    });

    const filterModel = new Gtk.FilterListModel({
      model: store,
      filter: filter
    });

    const taskList = new TaskList(filterModel);

    this.add(taskList);
  }
}
