import GObject from "gi://GObject";
import Adw from "gi://Adw";
import { TASK_DELETE_ICON } from "../static.js";
import { log } from "../utils/log-manager.js";


const TaskProperties = {
  taskId: GObject.ParamSpec.int(
    "taskId",
    "Task Id",
    "Task unique id",
    GObject.ParamFlags.READABLE,
    0,
  ),
  title: GObject.ParamSpec.string(
    "title",
    "Title",
    "Title task",
    GObject.ParamFlags.READWRITE,
    "",
  ),
  done: GObject.ParamSpec.boolean(
    "done",
    "Done",
    "Task status",
    GObject.ParamFlags.READWRITE,
    "",
  ),
  created: GObject.ParamSpec.string(
    "created",
    "Created At",
    "Task creation timestamp",
    GObject.ParamFlags.READWRITE,
    "",
  ),
};

const GObjectProperties = {
  GTypeName: "Task",
  Template: "resource:///io/github/andrepg/Doit/ui/task.ui",
  Properties: TaskProperties,
  InternalChildren: ["task_done", "task_delete"],
  Signals: {
    "task-updated": {
      param_types: [GObject.TYPE_OBJECT],
    },
    "task-deleted": {
      param_types: [GObject.TYPE_OBJECT],
    },
  },
}

export const Task = GObject.registerClass(GObjectProperties,
  class Task extends Adw.EntryRow {
    _init(taskId = 0, title = "", done = false, created = null) {
      // Store private properties to our object
      this._id = taskId;
      this._created_at = created ?? Date.now();
      this._is_deleted = false;

      super._init({ title: new Date(this._created_at).toLocaleDateString() });

      // Initialize main entry value
      this.set_text(title)
      this._task_done.set_active(done)

      // Call init events and drawers
      this._connect_events();
      this._update_interface();
    }

    _connect_events() {
      this.connect_after("apply", this.notify_task_changed.bind(this))

      this._task_done.connect("toggled", this.notify_task_finished.bind(this))

      this._task_delete.connect("clicked", this.notify_task_deleted.bind(this));
    }

    _update_interface() {
      const is_deleted = this._is_deleted;
      const is_done = this.get_done();
      const task_title = new Date(this._created_at).toLocaleDateString();
      const task_opacity_level = is_deleted || is_done ? 0.5 : 1;

      let task_tooltip = (is_done || is_deleted) ? _("Finished or deleted tasks can't be changed") : "";
      let checkbox_done_tooltip = is_done ? _("Reopen task") : _("Finish task");
      let delete_button_tooltip = is_deleted ?_("Restore task") : _("Delete task");
      let delete_button_icon = is_deleted ? TASK_DELETE_ICON.deleted : TASK_DELETE_ICON.default;

      this.set_title(task_title);
      this.set_tooltip_text(task_tooltip);

      this.set_opacity(task_opacity_level);
      this.set_editable(!(is_done || is_deleted))
      
      this._task_done.set_tooltip_text(checkbox_done_tooltip);
      this._task_done.set_sensitive(!is_deleted)

      this._task_delete.set_tooltip_text(delete_button_tooltip);
      this._task_delete.set_icon_name(delete_button_icon);
    }

    get_done() {
      return this._task_done.get_active();
    }

    notify_task_changed() {
      this.emit('task-updated', this)

      this.get_root().display_message_toast(_("Task %s updated").format(this.get_text()))
      this._update_interface()
    }

    notify_task_finished(checkbox) {
      this.emit('task-updated', this)

      const message = checkbox.get_active() ? _("Task %s finished") : _("Task %s reopened")

      this.get_root().display_message_toast(message.format(this.get_text()))
      this._update_interface()

      log("task", "Task finished")
    }

    notify_task_deleted() {
      this.emit('task-deleted', this)

      const message = this._is_deleted ? _("Task %s restored") : _("Task %s deleted");

      this._is_deleted = !this._is_deleted;

      this._update_interface()

      this.get_root().display_message_toast(message.format(this.get_text()))

      log("task", "Task deleted")
    }

    to_widget() {
      return this;
    }

    to_object() {
      return {
        taskId: this._id,
        title: this.get_text().trim(),
        done: this.get_done(),
        created_at: this._created_at,
        is_deleted: this._is_deleted,
      };
    }
  },
);
