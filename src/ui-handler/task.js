import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

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
    InternalChildren: ["task_done", "task_entry", "task_label", "task_delete"],
    Signals: {
      "task-updated": {
        param_types: [GObject.TYPE_OBJECT],
      },
      "task-deleted": {
        param_types: [GObject.TYPE_OBJECT],
      },
    },
  },
  class Task extends Gtk.ListBoxRow {
    _init(taskId = 0, title = "", done = false, deleted = false) {
      super._init();

      this._id = taskId;
      this._title = title;
      this._done = done;
      this._deleted = deleted;

        this._set_task_format();
        this._attach_ui_events();
        this._set_ui_format();
    }

    _set_ui_format() {
        this.set_opacity(!this._done ? 1 : 0.5);

        this._task_label.set_visible(this._done);
        this._task_entry.set_visible(!this._done);
    }

    _attach_ui_events() {
        this._task_entry.connect("changed",
            (entry) => this.set_title(entry.get_text())
        )

        this._task_done.connect("toggled",
            (checkbox) => this.set_done(checkbox.get_active())
        )
    }

    _set_task_format() {
        const markup_text = GLib.markup_escape_text(this._title, -1);

      this._task_label.set_markup(`<s>${markup_text}</s>`);
      this._task_entry.set_text(this._title);
      this._task_done.set_active(this._done);
    }

    get_title() {
      return this._title;
    }

    get_done() {
      return this._done;
    }

    set_title(value) {
        this._title = value

        this._set_ui_format()

        this.emit('task-updated', this)
    }

    set_done(value) {
      console.log(`[task] ${this._title} - set done state to ${value}`);

        this._done = value

        this._set_ui_format()

        this.emit('task-updated', this)
    }

    set_deleted(value) {
        console.log(`[task] ${this._title} - set deleted state to ${value}`);

        this._deleted = value;
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
