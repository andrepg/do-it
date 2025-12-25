import GObject from "gi://GObject";
import Adw from "gi://Adw";
import { getTaskIcon } from "../static.js";
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
  deleted: GObject.ParamSpec.boolean(
    "deleted",
    "Deleted",
    "Deletion task status",
    GObject.ParamFlags.READWRITE,
    "",
  ),
};

export const Task = GObject.registerClass(
  {
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
  },
  class Task extends Adw.EntryRow {
    _init(taskId = 0, title = "", done = false, deleted = "", created_at = null) {
      super._init();

      this.set_text(title)

      this._id = taskId;
      this._deleted = deleted;
      this._task_done.set_active(done)
      this._created_at = created_at ?? Date.now();

      this._connect_events();
      this._update_interface();
    }

    _connect_events() {
      this.connect_after("apply", this.set_task_title.bind(this))

      this.connect_after("entry-activated", () => { log("task", "Task entry activated"); })

      this._task_done.connect("toggled", this.finish_task.bind(this))

      this._task_delete.connect("clicked", this.delete_task.bind(this));
    }

    _update_interface() {
      const disabled = this.get_done() || this.get_deleted() !== '';

      this.set_opacity(disabled ? 0.5 : 1)
      this.set_editable(!disabled)
      this.set_tooltip_text(disabled? _("Finished/deleted tasks can not be changed") : "");

      this._task_done.set_tooltip_text(
        this.get_done() ? _("Mark task as unfinished") : _("Mark task as finished")
      )

      this._task_delete.set_tooltip_text(
        this.get_deleted() ? _("Restore task") : _("Delete task")
      )

      this._task_delete.set_icon_name(getTaskIcon(this._deleted))
    }

    get_done() {
      return this._task_done.get_active();
    }

    get_deleted() {
      return this._deleted;
    }

    set_task_title() {
      this._update_interface()

      this._notify(_("Task %s updated").format(this.get_text()))

      this.emit('task-updated', this)
    }

    finish_task(checkbox) {
      this._update_interface()

      log("task", "Task finished")

      const message = checkbox.get_active()
        ? _("%s marked as finished")
        : _("%s marked as not finished")

      this._notify(message.format(this.get_text()))

      this.emit('task-updated', this)
    }

    delete_task() {
      this._deleted = this._deleted == "" ? Date.now().toString() : "";

      this._update_interface()

      log("task", "Task deleted")

      const message = this._deleted
        ? _("Task %s deleted")
        : _("Task %s restored")

      this._notify(message.format(this.get_text()))

      this.emit('task-deleted', this)
    }

    _notify(message) {
      this.get_root().display_message_toast(message)
    }

    to_widget() {
      return this;
    }

    to_object() {
      return {
        taskId: this._id,
        title: this.get_text(),
        done: this.get_done(),
        deleted: this.get_deleted(),
        created_at: this._created_at,
      };
    }
  },
);
