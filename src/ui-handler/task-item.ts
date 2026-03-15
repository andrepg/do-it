import Adw from "gi://Adw"
import GObject from "gi://GObject"
import { ITask } from "../app.types.js";
import { get_template_path } from "../utils/application.js";
import Gtk from "gi://Gtk";

const TaskItemProperties = {
  GTypeName: 'TaskItem',
  Template: get_template_path('ui/task.ui'),
  Properties: {
    task: GObject.ParamSpec.object(
      "task",
      "Task",
      "Task",
      GObject.ParamFlags.READWRITE,
      GObject.TYPE_OBJECT
    ),
  },
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

/**
 * Represents a single task row in the UI.
 * 
 * Hierarchy: TaskGroup -> TaskList -> TaskItem
 * 
 * Inherits from Adw.ActionRow. This widget displays the task's title, 
 * creation date as a subtitle, and provides interactions such as a checkbox 
 * for marking the task as done and a button for deleting it.
 */
export class TaskItem extends Adw.ActionRow {
    static {
        GObject.registerClass(TaskItemProperties, this);
    }

    /**
     * @private Main task data
     * @type {ITask}
     */
    private task: ITask;

    /**
     * @private Checkbox to mark task as done
     * @type {Gtk.CheckButton}
     */
    private task_done: Gtk.CheckButton;

    /**
     * @private Button to delete task
     * @type {Gtk.Button}
     */
    private task_delete: Gtk.Button;

    /**
     * @constructor
     * @param {ITask} task - Task data
     */
    constructor(task: ITask) {
        super({
            title: task.title,
            subtitle: new Date(task.created_at).toLocaleDateString(),
            activatable: true,
        });
        
        this.task = task;

        this.task_done = this.get_template_child(TaskItem as unknown as GObject.GType, 'task_done') as Gtk.CheckButton;
        this.task_delete = this.get_template_child(TaskItem as unknown as GObject.GType, 'task_delete') as Gtk.Button;

        this.task_done.connect('toggled', () => {
            console.log("activated task done")
        });

        this.task_delete.connect('clicked', () => {
            console.log("activated task deleted")
        });
    }

    public get_project(): string {
        return this.task.project ?? '';
    }

    public to_widget(): TaskItem {
        return this;
    }

    public to_object(): ITask {
        return this.task;
    }
}