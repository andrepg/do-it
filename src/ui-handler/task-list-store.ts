import GObject from "gi://GObject";
import Gio from "gi://Gio"

import { Persistence } from "../utils/persistence.js";
import { ITask } from "../app.types.js";
import { log } from "../utils/log-manager.js";
import { useTaskSort } from "../hooks/tasks.sort.js";
import { TaskItem } from "./task-item.js";

export class TaskListStore extends Gio.ListStore<TaskItem> {
  static {
    GObject.registerClass({
      GTypeName: "TaskListStore",
      Properties: {},
      InternalChildren: [],
      Signals: {},
    }, this);
  }

  private task_sort = useTaskSort();

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

    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();

    const _update_interface = (signal: string) => {
      log("list-store", `Received ${signal} signal.`)

      this.sort(this.task_sort.sort_by(mode, strategy))

      this.persist_store()
      this.task_sort.persist_sort_preferences();
    }

    task.connect('task-updated', _update_interface.bind(this, 'task-updated'));
    task.connect('task-deleted', _update_interface.bind(this, 'task-deleted'));

    this.insert_sorted(task, this.task_sort.sort_by(mode, strategy));

    this.persist_store();
  }

  sort_list() {
    const { mode, strategy } = this.task_sort.retrieve_sort_preferences();

    this.sort(this.task_sort.sort_by(mode, strategy));
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
