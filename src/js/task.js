import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

export const Task = GObject.registerClass({
  GTypeName: "Task",
  Template: 'resource:///br/dev/startap/tasks/ui/task.ui',
  Properties: {
    'title': GObject.ParamSpec.string('title', 'Title', 'Title of task', GObject.ParamFlags.READWRITE, ''),
    'done': GObject.ParamSpec.boolean('done', 'Done', 'Task status', GObject.ParamFlags.READWRITE, '')
  },
  InternalChildren: [
    "task_entry_status",
    "task_entry_title"
  ],
}, class Task extends Gtk.ListBoxRow {

  _init(title = "", done = false) {
    super._init();

    this._title = title;
    this._done = done;

    console.log(this);

    this._task_entry_title.set_text(title);
    this._task_entry_status.set_active(done);

    this._task_entry_title.connect("changed", () => {
      this.title = this._task_entry_title.text;
    });

    this._task_entry_status.connect("toggled", () => {
      this.done = this._task_entry_status.active;
    });
  }

  get title() {
    return this._title;
  }

  set title(value) {
    this._title = value;
    this.notify('title');
  }

  get done() {
    return this._done;
  }

  set done(value) {
    this._done = value
    this.notify('done');
  }

  to_widget() {
    return this;
  }
});

