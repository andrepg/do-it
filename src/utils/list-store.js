import GObject from "gi://GObject";
import Gio from "gi://Gio"

import { Persistence } from "./persistence.js";
import { Task } from "../ui-handler/task.js";

export const TaskListStore = GObject.registerClass({
  GTypeName: "TaskListStore",
  Properties: {},
  InternalChildren: [],
  Signals: {},
}, class TaskListStoreObject extends Gio.ListStore {
  _sort_done = (item) => item.get_task_done();

  get_all() {
    const items = [];

    for (let index = 0; index < this.get_count(); index++) {
      items.push(this.get_item(index).to_object());
    }

    return items;
  }

  get_count() {
    return this.get_n_items();
  }

  new_task(title) {
    const task = this._create_task(title)

    this.append(task)
    this.sort(this._sort_done)

    this.persist()
  }

  _create_task(title, done = false, deleted = "", taskId = null) {
    const task = new Task(
      taskId ?? this.get_count() + 1,
      title,
      done,
      deleted
    );

    task.connect('task-updated', () => {
      console.log("[list-store] Received task-updated signal.")

      this.sort(this._sort_done)
      this.persist()
    })

    task.connect('task-deleted', () => {
      console.log("[list-store] Received task-deleted signal.")

      this.sort(this._sort_done)
      this.persist()
    })

    return task;
  }


  persist() {
    console.log("[persistence] Saving tasks to database");

    (new Persistence).saveToFile(
      this.get_all().filter(item => !item.deleted)
    )
  }

  load() {
    console.log("[persistence] Loading tasks from database")

    const items = (new Persistence).readFromFile()

    items.forEach(item => {
      const widget = this._create_task(
        item.title,
        item.done,
        item.deleted,
        item.taskId
      )

      this.insert_sorted(widget, this._sort_done)
    })
  }
})
