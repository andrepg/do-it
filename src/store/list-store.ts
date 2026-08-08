import GObject from "gi://GObject";
import Gio from "gi://Gio";

import { GioFilePersistence } from "../persistence/gio-persistence.js";

import { log } from '~/utils/log-manager.js';

import { TaskItem } from "~/views/task-item.js";
import { ITask } from "~/app.types.js";
import GLib from "gi://GLib";
import { AppSignals } from "~/app.enums.js";
import { retrieve_sort_preferences, sort_by } from "~/utils/tasks.sort.js";
import { DoItMainWindow } from "~/views/doit.js";
import { ActionNames } from "~/static/actions.js";


const TaskListStoreType = {
    GTypeName: "TaskListStore",
    Signals: {
        [AppSignals.TaskUpdated]: { param_types: [GObject.TYPE_OBJECT] },
        [AppSignals.TaskDeleted]: { param_types: [GObject.TYPE_OBJECT] },
    }
};

const messages = {
    log_class: 'task-list-store',
    load_tasks: 'Loading tasks...',
    load_tasks_failed: 'Failed to load tasks - ',
    persist_tasks: 'Persisting tasks...',
    append_task: 'Appending task to list store - ',
}

export class TaskListStore extends Gio.ListStore<TaskItem> {
    static { GObject.registerClass(TaskListStoreType, this); }
    public static LogClass = messages.log_class;

    private static instance: TaskListStore | null = null;

    /**
     * Returns the app-wide TaskListStore singleton.
     */
    static get_default(): TaskListStore {
        return (this.instance ??= new TaskListStore());
    }

    private persistence: GioFilePersistence;

    constructor() {
        super();

        this.persistence = new GioFilePersistence();
    }

    get_count(): number {
        return this.get_n_items();
    }

    /**
     * Retrieves all tasks in the current store.
     * 
     * @param convertToWidget If true, returns TaskItem widgets; otherwise, returns plain objects.
     */
    get_all<T = TaskItem>(asWidget = false): Array<T | ITask> {
        const items: Array<T | ITask> = [];

        for (let index = 0; index < this.get_count(); index++) {
            let item = this.get_item(index) as TaskItem;

            if (asWidget) item = item.to_widget() as TaskItem;

            items.push(item.to_object());
        }

        return items;
    }

    /**
     * Appends a new TaskItem to the list store.
     * @param task The task to append.
     */
    append_task(task: ITask) {
        log(TaskListStore.LogClass, messages.append_task.concat(task.id ?? 'new'));

        const taskId = task.id ?? GLib.uuid_string_random();

        const taskItem = new TaskItem(
            taskId,
            task.title,
            task.done,
            task.created_at,
            task.project,
            task.deleted
        );

        taskItem.connect(
            AppSignals.TaskUpdated,
            () => this.task_changed(AppSignals.TaskUpdated, taskItem)
        );

        taskItem.connect(
            AppSignals.TaskDeleted,
            () => this.task_changed(AppSignals.TaskDeleted, taskItem)
        );

        taskItem.connect(
            AppSignals.Activated,
            () => this.task_activated(taskItem)
        );

        this.insert_sorted(taskItem, this.get_sorting_preferences());
    }

    private get_sorting_preferences() {
        const prefs = retrieve_sort_preferences();

        return sort_by(prefs.mode, prefs.strategy);
    }

    /**
     * Handles widget activation, triggering the form
     * exhibition to edit a task
     *  
     * @param task origin's task
     */
    private task_activated(task: TaskItem) {
        console.log("Runing activated signal")
        const window = task.get_root() as DoItMainWindow;

        if (window?.activate_action) window.activate_action(
            ActionNames.TaskEdit,
            new GLib.Variant('s', task.to_object().id as string)
        );
    }

    /**
     * Handles internal state changes on a task, triggering updates 
     * and re-ordering in a sorted list.
     * 
     * @param signal signal emited by widget
     * @param task signal origin's task
     */
    private task_changed(signal: string, task: TaskItem) {
        log(TaskListStore.LogClass, `Received ${signal} signal.`);

        this.emit(signal, task);

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this.sort_tasks();
            this.persist_tasks();

            return GLib.SOURCE_REMOVE;
        });
    }

    /**
     * Finds a task in the list store by its ID.
     * 
     * @param id The ID of the task to find.
     * @returns The task with the specified ID, or null if not found.
     */
    find_by_id(id: string) {
        for (let index = 0; index < this.get_count(); index++) {
            const task = this.get_item(index) as TaskItem;

            if (task.to_object().id === id) return task;
        }
    }

    /**
     * Loads all tasks from the database asynchronously 
     * and appends them to the list store.
     */
    async load_tasks() {
        log(TaskListStore.LogClass, messages.load_tasks);

        try {
            const tasks = await this.persistence.load();

            tasks.forEach((task) => this.append_task(task));
        } catch (error) {
            log(TaskListStore.LogClass, messages.load_tasks_failed.concat(String(error)));
        }
    }

    /**
     * Saves all tasks to the database asynchronously.
     * 
     * @param purge If true, soft-deleted tasks will be removed from the database.
     */
    async persist_tasks(purge: boolean = false) {
        log(TaskListStore.LogClass, messages.persist_tasks);

        let tasks = this.get_all<ITask>();

        if (purge) tasks = tasks.filter((task) => !task.deleted);

        this.persistence.save(tasks);
    }

    /**
     * Sorts the list store based on current user sorting preferences.
     */
    sort_tasks() {
        this.sort(this.get_sorting_preferences());
    }
}