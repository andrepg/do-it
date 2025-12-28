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
      super._init();

      // Store private properties to our object
      this._id = taskId;
      this._created_at = created ?? Date.now();
      this._is_deleted = false;

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
      const disabled = this.get_done() || this._is_deleted;

      this.set_opacity(disabled ? 0.5 : 1);
      this.set_editable(!disabled);
      
      // FIXME : It seems that we're calling but it is not changing our UI
      this.set_title(new Date(this._created_at).toLocaleDateString());
      
      this.set_tooltip_text(
        disabled ? _("Finished/deleted tasks can not be changed") : ""
      );
      
      this._task_done.set_sensitive(! this._is_deleted)
      this._task_done.set_tooltip_text(
        this.get_done() ? _("Mark task as unfinished") : _("Mark task as finished")
      )

      this._task_delete.set_tooltip_text(
        this._is_deleted ? _("Restore task") : _("Delete task")
      )

      this._task_delete.set_icon_name(
        this._is_deleted ? TASK_DELETE_ICON.deleted : TASK_DELETE_ICON.default
      )
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

      const message = checkbox.get_active() ? _("Finished task %s") : _("%s marked as not finished")

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
        title: this.get_text(),
        done: this.get_done(),
        created_at: this._created_at,
        is_deleted: this._is_deleted,
      };
    }
  },
);
