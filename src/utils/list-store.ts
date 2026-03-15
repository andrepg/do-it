import GObject from "gi://GObject";
import Gio from "gi://Gio"

import { Persistence } from "./persistence.js";
import { ITask } from "../app.types.js";
import { log } from "./log-manager.js";
import { get_sorting_algorithm, set_sorting_algorithm } from "./sorting.js";
import { TaskItem } from "../ui-handler/task-item.js";

export class TaskListStore extends Gio.ListStore<TaskItem> {
  static {
    GObject.registerClass({
      GTypeName: "TaskListStore",
      Properties: {},
      InternalChildren: [],
      Signals: {},
    }, this);
  }

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

  get_count(): number {
    return this.get_n_items();
  }

  append_task(data: ITask) {
    const taskId = data.id ?? 0;

    const task = new TaskItem(
      (taskId > 0) ? taskId : this.get_count() + 1,
      data.title,
      data.done,
      data.created_at,
      data.project,
    )

    const _update_interface = (signal: string) => {
      log("list-store", `Received ${signal} signal.`)

      this.sort(get_sorting_algorithm())
      this.persist_store()
    }

    task.connect('task-updated', _update_interface.bind(this, 'task-updated'));
    task.connect('task-deleted', _update_interface.bind(this, 'task-deleted'));

    this.insert_sorted(task, get_sorting_algorithm());
  }

  sort_list(sort_mode: string) {
    log("list-store", `Sorting list by mode: ${sort_mode}`);

    set_sorting_algorithm(sort_mode);
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
    const tasks = this.get_all().filter(item => !item.deleted);

    const persistence = new Persistence();
    persistence.write_database(tasks);
  }

  load() {
    log("list-store", "Loading tasks from database")

    const persistence = new Persistence();
    const tasks = persistence.read_database() as ITask[];

    tasks.forEach((item) => {
      log("list-store", `Loading task ${item.title}`)
      this.append_task(item)
    })
  }
}
