import GObject from "gi://GObject";
import Adw from "gi://Adw";
import { TASK_DELETE_ICON, TASK_DELETE_TOOLTIP } from "../static.js";


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
    _init(taskId = 0, title = "", done = false, deleted = "") {
      super._init();

      this._id = taskId;
      this._title = title;
      this._done = done;
      this._deleted = deleted;

      this._update_interface();

      this.connect("apply", this.set_task_title.bind(this))

      this._task_done.connect("toggled", this.finish_task.bind(this))

      this._task_delete.connect("clicked", this.delete_task.bind(this));
    }

    _update_interface() {
      const disabled = this._done || this._deleted !== '';

      this.set_opacity(disabled ? 0.5 : 1)

      this.set_text(this._title)
      this.set_editable(!disabled)

      this.set_tooltip_text(disabled
        ? _("Items finished or deleted cannot be changed.")
        : ""
      );

      this._task_done.set_active(this._done)

      this._task_delete.set_icon_name(
        TASK_DELETE_ICON.getIcon(this._deleted)
      )
    }

    get_task_title() {
      return this._title;
    }

    get_task_done() {
      return this._done;
    }

    set_task_title(entry) {
      this._title = entry.get_text()

      this._update_interface()

      this._notify(_("Task %s updated").format(this._title))

      this.emit('task-updated', this)
    }

    finish_task(checkbox) {
      this._done = checkbox.get_active()

      this._update_interface()

      this._notify(this.done 
        ? _("Task %s marked as finished").format(this._title)
        : _("Task %s marked as not finished").format(this._title)
      )

      this.emit('task-updated', this)
    }

    delete_task() {
      console.log("[task] Deleting task")

      this._deleted = this._deleted == "" ? Date.now().toString() : "";

      this._update_interface()

      this._notify(_("Task %s deleted").format(this._title))

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
        title: this._title,
        done: this._done,
        deleted: this._deleted,
      };
    }
  },
);
