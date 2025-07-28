import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

const TaskProperties = {
    'taskId': GObject.ParamSpec.int(
        'taskId', 'Task Id', 'Task unique id',
        GObject.ParamFlags.READABLE, 0
    ),
    'title': GObject.ParamSpec.string(
        'title', 'Title', 'Title task',
        GObject.ParamFlags.READWRITE, ''
    ),
    'done': GObject.ParamSpec.boolean(
        'done', 'Done', 'Task status',
        GObject.ParamFlags.READWRITE, ''
    )
}

export const Task = GObject.registerClass({
    GTypeName: "Task",
    Template: 'resource:///io/github/andrepg/Doit/ui/task.ui',
    Properties: TaskProperties,
    InternalChildren: [
        'task_done',
        'task_entry',
        'task_label',
        'task_delete'
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

    _init(taskId = 0, title = "", done = false) {
        super._init();

        this._id = taskId;
        this._title = title;
        this._done = done;

        this._set_default_values();
        this._attach_events();
        this._set_properties();
    }

    _set_properties() {
        this.set_opacity(!this._done ? 1 : 0.5);        

        this._task_label.set_visible(this._done);
        this._task_entry.set_visible(!this._done);
    }

    _attach_events() {
        this._task_entry.connect("changed", () => {
            this._title = this._task_entry.get_text();
            
            this.emit('task-updated', this);
        });

        this._task_done.connect("toggled", () => {
            this._done = this._task_done.active;
            
            this._set_default_values();
            this._set_properties();

            this.emit('task-updated', this);
        });

        this._task_delete.connect(
            'clicked', 
            () => this.emit('task-deleted', this)
        );
    }

    _set_default_values() {
        const markup_text = GLib.markup_escape_text(this._title, -1);
        
        this._task_label.set_markup(`<s>${markup_text}</s>`);
        this._task_entry.set_text(this._title);
        this._task_done.set_active(this._done);
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

