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
  /**
  * Handles the database persistence from our list store
  * @type {Persistence}
  * @private
  */
  _persistence;

  _init() {
    super._init({ item_type: Task });

    this._persistence = new Persistence;
  }

  get_all() {
    const items = [];

    for (let index = 0; index < this.get_count(); index++) {
      items.push(this.get_item(index).to_object());
    }

    return items;
  }

  get_count() {
    return this.n_items;
  }

  new_task(title) {
    const task = new Task(
      this.get_count() + 1,
      title,
      false,
      false
    );

    task.connect('task-updated', () => console.log("updated"))
    task.connect('task-deleted', () => console.log("deleted"))

    this.append(task)
  }

  persist() {
    console.log("[persistence] Saving tasks to database");

    (new Persistence).saveToFile(this.get_all())
  }

  load() {
    console.log("[persistence] Loading tasks from database")

    const items = (new Persistence).readFromFile()

    console.log(items)
  }
  /***
  ");

  const items = (new Persistence).readFromFile().forEach(
    item => {
      const task = new Task(item.id, item.title, item.done, item.deleted)

      task.connect('task-updated', this.persist())
      task.connect('task-deleted', this.persist())

      this.append(task)


  */

})
