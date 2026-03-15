import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { TaskList } from './task-list.js';
import type { TaskListStore } from '../utils/list-store.js';
import { TaskItem } from './task-item.js';

import { get_template_path } from '../utils/application.js';

const GObjectProperties = {
  GTypeName: "TaskGroup",
  Template: get_template_path('ui/task-group.ui'),
};

/**
 * A UI component representing a visual group of tasks for a specific project.
 * 
 * Hierarchy: DoItMainWindow (Main view list_container) -> TaskGroup -> TaskList -> TaskItem(s)
 * 
 * Inherits from Adw.PreferencesGroup. It applies a Gtk.CustomFilter to the
 * global TaskListStore so it only includes tasks matching its assigned project string.
 * It contains a single TaskList child that renders those filtered tasks.
 */
export class TaskGroup extends Adw.PreferencesGroup {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  /**
   * @constructor
   * @param {string} project - The respective project name to be filtered
   * @param {TaskListStore} store - The global state store containing all tasks
   */
  constructor(project: string, store: TaskListStore) {
    const groupTitle = project === "" ? _("Without project") : project;

    super({ title: groupTitle });

    const filter = new Gtk.CustomFilter();
    filter.set_filter_func(
      (item: GObject.Object) => (item as TaskItem).get_project() === project
    );

    const filterModel = new Gtk.FilterListModel({
      model: store,
      filter: filter
    });

    const taskList = new TaskList(filterModel);

    this.add(taskList);
  }
}
