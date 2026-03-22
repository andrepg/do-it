import GObject from "gi://GObject";
import Gio from "gi://Gio"

import { Persistence } from "../utils/persistence.js";
import { ITask } from "../app.types.js";
import { log } from "../utils/log-manager.js";
import { useTaskSort } from "../hooks/tasks.sort.js";
import { TaskItem } from "./task-item.js";

const TaskListStoreType = {
  GTypeName: 'TaskListStore',
}

/**
 * A global list store containing all TaskItem instances.
 * 
 * Inherits from Gio.ListStore. It handles sorting, persisting task changes to disk,
 * and maintaining the comprehensive list of tasks for the application state.
 */
export class TaskListStore extends Gio.ListStore<TaskItem> {
  static {
    GObject.registerClass(TaskListStoreType, this);
  }

  private persistence = new Persistence();
  private task_sort = useTaskSort();

  /**
   * Retrieves all tasks current loaded in the internal store as plain serializable objects.
   */
  get_all(): ITask[] {
    const tasks: ITask[] = [];

    for (let index = 0; index < this.get_count(); index++) {
      const item = this.get_item(index);
      if (item instanceof TaskItem) {
        tasks.push(item.to_object());
      }
    }

    return tasks;
  }

  /**
   * Returns the total amount of tasks tracked in the store.
   */
  get_count(): number {
    return this.get_n_items();
  }

  /**
   * Instantiates and registers a new TaskItem into the list store.
   * 
   * @param data Raw initialization data for the new task.
   */
  append_task(data: ITask) {
    const taskId = data.id ?? 0;

    const task = new TaskItem(
      (taskId > 0) ? taskId : this.get_count() + 1,
      data.title,
      data.done,
      data.created_at,
      data.project,
    )

    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();

    const _update_interface = (signal: string) => {
      log("list-store", `Received ${signal} signal.`)

      this.task_sort.persist_sort_preferences();
      this.sort_list()
      this.persist_store();
    }

    task.connect('task-updated', _update_interface.bind(this, 'task-updated'));
    task.connect('task-deleted', _update_interface.bind(this, 'task-deleted'));

    this.insert_sorted(task, this.task_sort.sort_by(mode, strategy));
  }

  /**
   * Forces the list store to perform an internal sort based on global preferences.
   */
  sort_list() {
    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();

    this.sort(this.task_sort.sort_by(mode, strategy));
  }

  /**
   * Erases all logically soft-deleted entries from the database, reloading the state afterwards.
   */
  purge_deleted() {
    log("list-store", "Purging deleted entries")

    this.persist_store(false)
    this.remove_all()
    this.load()
  }

  /**
   * Triggers a rewrite of the current state of tasks to the local JSON database file.
   * 
   * @param keep_deleted If false, soft-deleted elements will not be saved (causing removal).
   */
  persist_store(keep_deleted = true) {
    log("list-store", "Saving tasks to database");
    const tasks = this.get_all().filter(item => keep_deleted ? true : !item.deleted);

    this.persistence.write_database(tasks);
  }

  /**
   * Initializes the application state, reading tasks from the disk and appending them to the store.
   */
  load() {
    log("list-store", "Loading tasks from database")

    const tasks = this.persistence.read_database() as ITask[];

    tasks.forEach((item) => {
      log("list-store", `Loading task ${item.title}`)
      this.append_task(item)
    })
  }
}
