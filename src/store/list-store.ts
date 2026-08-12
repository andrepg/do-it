import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

import { GioFilePersistence } from '../persistence/gio-persistence.js';

import { log } from '~/utils/log-manager.js';

import { TaskItem } from '~/views/task-item.js';
import { ITask } from '~/app.types.js';
import GLib from 'gi://GLib';
import { AppSignals } from '~/app.enums.js';
import { retrieve_sort_preferences, sort_by } from '~/utils/tasks.sort.js';
import { DoItMainWindow } from '~/views/doit.js';
import { ActionNames } from '~/static/actions.js';
import { AppDebug } from '~/static/messages.js';

const TaskListStoreType = {
  GTypeName: 'TaskListStore',
  Signals: {
    [AppSignals.TaskUpdated]: { param_types: [GObject.TYPE_OBJECT] },
    [AppSignals.TaskDeleted]: { param_types: [GObject.TYPE_OBJECT] },
  },
};

export class TaskListStore extends Gio.ListStore<TaskItem> {
  static {
    GObject.registerClass(TaskListStoreType, this);
  }
  public static LogClass = 'task-list-store';

  private static instance: TaskListStore | null = null;

  /**
   * Returns the app-wide TaskListStore singleton.
   */
  static get_default(): TaskListStore {
    return (this.instance ??= new TaskListStore());
  }

  private persistence: GioFilePersistence;

  constructor() {
    super();

    this.persistence = new GioFilePersistence();
  }

  get_count(): number {
    return this.get_n_items();
  }

  /**
   * Retrieves all tasks in the current store.
   */
  get_all(): ITask[] {
    const items: ITask[] = [];

    for (let index = 0; index < this.get_count(); index++) {
      const item = this.get_item(index) as TaskItem;
      items.push(item.to_object());
    }

    return items;
  }

  /**
   * Appends a new TaskItem to the list store.
   * @param task The task to append.
   */
  append_task(task: ITask) {
    log(TaskListStore.LogClass, AppDebug.TASK_STORE_APPEND.concat(task.id ?? 'new'));

    const taskId = task.id ?? GLib.uuid_string_random();

    const taskItem = new TaskItem(
      taskId,
      task.title,
      task.done,
      task.created_at,
      task.project,
      task.deleted,
    );

    taskItem.connect(AppSignals.TaskUpdated, () =>
      this.task_changed(AppSignals.TaskUpdated, taskItem),
    );

    taskItem.connect(AppSignals.TaskDeleted, () =>
      this.task_changed(AppSignals.TaskDeleted, taskItem),
    );

    taskItem.connect(AppSignals.Activated, () => this.task_activated(taskItem));

    this.insert_sorted(taskItem, this.get_sorting_preferences());
  }

  private get_sorting_preferences() {
    const prefs = retrieve_sort_preferences();

    return sort_by(prefs.mode, prefs.strategy);
  }

  /**
   * Handles widget activation, triggering the form
   * exhibition to edit a task
   *
   * @param task origin's task
   */
  private task_activated(task: TaskItem) {
    const window = task.get_root() as DoItMainWindow;

    if (window?.activate_action)
      window.activate_action(
        ActionNames.TaskEdit,
        new GLib.Variant('s', task.to_object().id as string),
      );
  }

  /**
   * Handles internal state changes on a task, triggering updates
   * and re-ordering in a sorted list.
   *
   * @param signal signal emited by widget
   * @param task signal origin's task
   */
  private task_changed(signal: string, task: TaskItem) {
    log(TaskListStore.LogClass, `Received ${signal} signal.`);

    this.emit(signal, task);

    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.sort_tasks();
      this.persist_tasks();

      return GLib.SOURCE_REMOVE;
    });
  }

  /**
   * Finds a task in the list store by its ID.
   *
   * @param id The ID of the task to find.
   * @returns The task with the specified ID, or null if not found.
   */
  find_by_id(id: string) {
    for (let index = 0; index < this.get_count(); index++) {
      const task = this.get_item(index) as TaskItem;

      if (task.to_object().id === id) return task;
    }
  }

  /**
   * Loads all tasks from the database and appends them to the list store.
   */
  load_tasks(): void {
    log(TaskListStore.LogClass, AppDebug.TASK_STORE_LOAD);

    try {
      const tasks = this.persistence.load();

      tasks.forEach((task) => this.append_task(task));
    } catch (error) {
      log(TaskListStore.LogClass, AppDebug.TASK_STORE_LOAD_FAILED.concat(String(error)));
    }
  }

  /**
   * Reloads all tasks from the database, discarding the current store state.
   */
  reload_tasks(): void {
    this.remove_all();
    this.load_tasks();
  }

  /**
   * Permanently removes soft-deleted tasks from the store and database.
   */
  purge_finished_tasks(): void {
    for (let index = this.get_count() - 1; index >= 0; index--) {
      const item = this.get_item(index) as TaskItem;

      if (item.done) this.remove(index);
    }

    this.persist_tasks(true);
  }

  /**
   * Permanently removes soft-deleted tasks from the store and database.
   */
  purge_deleted_tasks(): void {
    for (let index = this.get_count() - 1; index >= 0; index--) {
      const item = this.get_item(index) as TaskItem;

      if (item.deleted) this.remove(index);
    }

    this.persist_tasks(true);
  }

  /**
   * Saves all tasks to the database.
   *
   * @param purge If true, soft-deleted tasks will be removed from the database.
   */
  persist_tasks(purge: boolean = false): void {
    log(TaskListStore.LogClass, AppDebug.TASK_STORE_PERSIST);

    let tasks = this.get_all();

    if (purge) tasks = tasks.filter((task) => !task.deleted);

    this.persistence.save(tasks);
  }

  /**
   * Sorts the list store based on current user sorting preferences.
   */
  sort_tasks() {
    this.sort(this.get_sorting_preferences());
  }
}
