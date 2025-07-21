import GObject from "gi://GObject";
import Gtk from "gi://Gtk";

export const Task = GObject.registerClass({
  GTypeName: "Task",
  Template: 'resource:///br/dev/startap/tasks/ui/task.ui',
  Properties: {
    'taskId': GObject.ParamSpec.int('taskId', 'Task Id', 'Task unique id', GObject.ParamFlags.READABLE, 0),
    'title': GObject.ParamSpec.string('title', 'Title', 'Title of task', GObject.ParamFlags.READWRITE, ''),
    'done': GObject.ParamSpec.boolean('done', 'Done', 'Task status', GObject.ParamFlags.READWRITE, '')
  },
  InternalChildren: [
    "task_entry_status",
    "task_entry_title",
    "task_entry_delete",
  ],
  Signals: {
    'task-updated': {
      param_types: [GObject.TYPE_OBJECT]
    },
    'task-deleted': {
      param_types: [GObject.TYPE_OBJECT]
    },
  }
}, class Task extends Gtk.ListBoxRow {

  _init(taskId, title = "", done = false) {
    super._init();

    this._id = taskId;
    this._title = title;
    this._done = done;

    this._set_default_values();
    this._attach_events();
  }

  _attach_events() {
    this._task_entry_title.connect("apply", () => {
      this._title = this._task_entry_title.text;
      this.emit('task-updated', this);
    });

    this._task_entry_status.connect("toggled", () => {
      this._done = this._task_entry_status.active;
      this.emit('task-updated', this);
    });

    this._task_entry_delete.connect('clicked', () => {
      this.emit('task-deleted', this)
    });
  }

  _set_default_values() {
    this._task_entry_title.set_text(this._title);
    this._task_entry_status.set_active(this._done);
  }

  get taskId() {
    return this._id
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

  to_object() {
    return {
      taskId: this._id,
      title: this._title,
      done: this._done
    }
  }
});

