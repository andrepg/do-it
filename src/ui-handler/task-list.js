import { TaskListStore } from "../utils/list-store.js";
import { Task } from "./task.js";

const { GObject, Gtk } = imports.gi;

const TaskListProperties = {
    'title': GObject.ParamSpec.string(
        "title", "List title", "List title to show to user",
        GObject.ParamFlags.READWRITE, "List name"
    ),
    'subtitle': GObject.ParamSpec.string(
        "subtitle", "List subtitle", "List subtitle to show to user",
        GObject.ParamFlags.READWRITE, "A list description"
    ),
}

export const TaskList = GObject.registerClass({
    GTypeName: "TaskList",
    Template: "resource:///io/github/andrepg/Doit/ui/task-list.ui",
    Properties: TaskListProperties,
    InternalChildren: [
        'task_list_title',
        'task_list_delete_all',
        'task_listbox',
    ],
    Signals: {}
}, class TaskList extends Gtk.Box {

    _init(title = "", subtitle = "") {
        super._init();

        console.log(`[task-list] Initializing task list ${title}`)

        this._task_list_title.set_title(title);
        this._task_list_title.set_subtitle(subtitle);

        this._setup_list_store()
        this._set_visibility()
    }

    get_list() {
        return this._list_store;
    }

    _setup_list_store() {
        console.log(`[task-list] Initializing list store`);

        this._list_store = new TaskListStore({ type: Task });

        console.log(`[task-list] Attach items-changed event`);

        this._list_store.connect(
            'items-changed',
            this._set_visibility.bind(this)
        )

        this._task_listbox.bind_model(this._list_store, task => task.to_widget());
    }

    _set_visibility() {
        this.set_visible(this._list_store.get_count() > 0)
        console.log(`[task-list] Set visibility to ${this.get_visible()}`);
    }

    add_task(task) {
        console.log(`[task-list] Adding task ${task.title}`);

        const taskObj = new Task(
            this._list_store.get_count() + 1,
            task.title
        );

        taskObj.set_visible(!task.deleted)

        this._list_store.append(taskObj)
    }

    get_count() {
        return this._list_store.get_count();
    }

    to_list_object() { }
});
