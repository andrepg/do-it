import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { GioFilePersistence } from '../persistence/gio-persistence.js';

import { log } from '~/utils/log-manager.js';

import { Task } from '~/models/task.js';
import { ITask } from '~/app.types.js';
import { AppSignals } from '~/app.enums.js';
import { retrieve_sort_preferences, sort_by } from '~/utils/tasks.sort.js';
import { AppDebug } from '~/static/messages.js';

const TaskListStoreType = {
  GTypeName: 'TaskListStore',
  Signals: {
    [AppSignals.TaskUpdated]: { param_types: [GObject.TYPE_OBJECT] },
    [AppSignals.TaskDeleted]: { param_types: [GObject.TYPE_OBJECT] },
  },
};

export class TaskListStore extends Gio.ListStore<Task> {
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
  private _persist_timer: number | null = null;

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
      const item = this.get_item(index) as Task;
      items.push(item.to_object());
    }

    return items;
  }

  /**
   * Appends a new Task to the list store.
   * Signal wiring is handled externally by the view layer.
   * @param task The task data to append.
   */
  append_task(task: ITask) {
    log(TaskListStore.LogClass, AppDebug.TASK_STORE_APPEND.concat(task.id ?? 'new'));

    const newTask = new Task(task);

    this.insert_sorted(newTask, this.get_sorting_preferences());
  }

  private get_sorting_preferences() {
    const prefs = retrieve_sort_preferences();

    return sort_by(prefs.mode, prefs.strategy);
  }

  /**
   * Handles internal state changes on a task, triggering updates
   * and re-ordering in a sorted list.
   *
   * Called by the view layer when a TaskItem signal fires.
   *
   * @param signal signal emitted by TaskItem
   * @param task the Task model that changed
   */
  public on_task_changed(signal: string, task: Task) {
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
   * @returns The task with the specified ID, or undefined if not found.
   */
  find_by_id(id: string): Task | undefined {
    for (let index = 0; index < this.get_count(); index++) {
      const task = this.get_item(index) as Task;

      if (task.taskId === id) return task;
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
   * Permanently removes finished tasks from the store and database.
   */
  purge_finished_tasks(): void {
    for (let index = this.get_count() - 1; index >= 0; index--) {
      const item = this.get_item(index) as Task;

      if (item.done) this.remove(index);
    }

    this.persist_tasks(true);
  }

  /**
   * Permanently removes soft-deleted tasks from the store and database.
   */
  purge_deleted_tasks(): void {
    for (let index = this.get_count() - 1; index >= 0; index--) {
      const item = this.get_item(index) as Task;

      if (item.deleted) this.remove(index);
    }

    this.persist_tasks(true);
  }

  /**
   * Saves all tasks to the database, debounced.
   *
   * Batches rapid mutations into a single write within a 300ms window.
   * Use {@link flush} to bypass the debounce and write immediately.
   *
   * @param purge If true, soft-deleted tasks will be removed from the database.
   */
  persist_tasks(purge: boolean = false): void {
    if (this._persist_timer !== null) {
      GLib.source_remove(this._persist_timer);
      this._persist_timer = null;
    }

    this._persist_timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT_IDLE, 300, () => {
      this._do_persist(purge);
      this._persist_timer = null;
      return GLib.SOURCE_REMOVE;
    });
  }

  /**
   * Immediately persists all tasks, bypassing the debounce timer.
   *
   * Called on app close to guarantee data is written before shutdown.
   *
   * @param purge If true, soft-deleted tasks will be removed from the database.
   */
  flush(purge: boolean = false): void {
    if (this._persist_timer !== null) {
      GLib.source_remove(this._persist_timer);
      this._persist_timer = null;
    }

    this._do_persist(purge);
  }

  private _do_persist(purge: boolean): void {
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
