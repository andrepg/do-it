import GObject from "gi://GObject";
import Gio from "gi://Gio"

import { Persistence } from "./persistence.js";
import { Task } from "../ui-handler/task.js";
import { log } from "./log-manager.js";
import { get_setting_string, set_setting_string } from "./application.js";
import { get_sorting_algorithm, SortingModes, SortingStrategy } from "./sorting.js";

export const TaskListStore = GObject.registerClass({
  GTypeName: "TaskListStore",
  Properties: {},
  InternalChildren: [],
  Signals: {},
}, class TaskListStoreObject extends Gio.ListStore {
  get_all() {
    const tasks = [];

    for (let index = 0; index < this.get_count(); index++) {
      tasks.push(this.get_item(index).to_object());
    }

    return tasks;
  }

  get_count() {
    return this.get_n_items();
  }

  append_task({ title, done = false, deleted = "", taskId = null, created_at = null }) {
    const task = new Task(
      taskId ?? this.get_count() + 1,
      title,
      done,
      deleted,
      created_at,
    );

    const _update_interface = (signal) => {
      log("list-store", `Received ${signal} signal.`)

      this.sort(get_sorting_algorithm())
      this.persist_store()
    }

    task.connect('task-updated', _update_interface.bind(this, 'task-updated'));
    task.connect('task-deleted', _update_interface.bind(this, 'task-deleted'));

    this.insert_sorted(task, get_sorting_algorithm());
  }

  sort_list(sort_mode) {
    const last_known_sorting_strategy = get_setting_string("last-sorting-strategy") || SortingStrategy.ASCENDING;

    const new_sorting_strategy = last_known_sorting_strategy == SortingStrategy.ASCENDING
      ? SortingStrategy.DESCENDING
      : SortingStrategy.ASCENDING;

    set_setting_string('last-sorting-strategy', new_sorting_strategy);
    set_setting_string("last-sorting-mode", sort_mode);

    log("list-store", `Sorting list by mode: ${sort_mode}`);
    this.sort(get_sorting_algorithm());
  }

  purge_deleted() {
    log("list-store", "Purging deleted entries")

    this.persist_store()
    this.remove_all()
    this.load()
  }

  persist_store() {
    log("list-store", "Saving tasks to database");

    (new Persistence).write_database(
      this.get_all().filter(item => !item.deleted)
    )
  }

  load() {
    log("list-store", "Loading tasks from database")

    const tasks = (new Persistence).read_database()

    tasks.forEach(item => {
      const widget = this.append_task({
        taskId: item.taskId,
        title: item.title,
        done: item.done,
        created_at: item.created_at,
        deleted_at: item.deleted_at,
      })

      log("list-store", `Loaded task ${item.title} (done: ${item.done}, deleted: ${item.deleted_at}, created_at: ${item.created_at})`)
    })
  }
})
