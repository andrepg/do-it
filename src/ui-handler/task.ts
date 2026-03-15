import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import GObject from "gi://GObject";

import type { TasksWindow } from "./window.js";
import { TASK_DELETE_ICON } from "../static.js";
import { log } from "../utils/log-manager.js";
import { get_resource_path, get_template_path } from "../utils/application.js";
import { ITask } from "../app.types.js";

// Declare _ global for translation
declare function _(id: string): string;

const TaskProperties = {
  taskId: GObject.ParamSpec.int(
    "taskId",
    "Task Id",
    "Task unique id",
    GObject.ParamFlags.READABLE,
    0,
    2147483647,
    0
  ),
  title: GObject.ParamSpec.string(
    "title",
    "Title",
    "Title task",
    GObject.ParamFlags.READWRITE,
    ""
  ),
  done: GObject.ParamSpec.boolean(
    "done",
    "Done",
    "Task status",
    GObject.ParamFlags.READWRITE,
    false
  ),
  created: GObject.ParamSpec.string(
    "created",
    "Created At",
    "Task creation timestamp",
    GObject.ParamFlags.READWRITE,
    ""
  ),
  project: GObject.ParamSpec.string(
    "project",
    "Project",
    "Task project",
    GObject.ParamFlags.READWRITE,
    ""
  ),
};

const GObjectProperties = {
  GTypeName: "Task",
  Template: get_template_path('ui/task.ui'),
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

export class Task extends Adw.ActionRow {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  private _id: number = 0;
  private _created_at: number = 0;
  private _is_deleted: boolean = false;
  private _project: string = "";

  private task_done!: Gtk.CheckButton;
  private task_delete!: Gtk.Button;

  constructor(taskId = 0, title = "", done = false, created: number | null = null, project: string = "") {
    const created_at = created ?? Date.now();
    super({
      title: title,
      subtitle: new Date(created_at).toLocaleDateString()
    });

    // Store private properties to our object
    this._id = taskId;
    this._created_at = created_at;
    this._is_deleted = false;
    this._project = project;

    this.task_done = this.get_template_child(Task as unknown as GObject.GType, 'task_done') as Gtk.CheckButton;
    this.task_delete = this.get_template_child(Task as unknown as GObject.GType, 'task_delete') as Gtk.Button;

    // Initialize main entry value
    this.task_done.set_active(done)

    // Call init events and drawers
    this._connect_events();
    this._update_interface();
  }

  private _connect_events(): void {
    this.connect("activated", this.notify_task_activated.bind(this));

    this.task_done.connect("toggled", this.notify_task_finished.bind(this))

    this.task_delete.connect("clicked", this.notify_task_deleted.bind(this));
  }

  private _update_interface(): void {
    const is_deleted = this._is_deleted;
    const is_done = this.get_done();
    const task_subtitle = new Date(this._created_at).toLocaleDateString();
    const task_opacity_level = is_deleted || is_done ? 0.5 : 1;

    let task_tooltip = (is_done || is_deleted) ? _("Finished or deleted tasks can't be changed") : "";
    let checkbox_done_tooltip = is_done ? _("Reopen task") : _("Finish task");
    let delete_button_tooltip = is_deleted ? _("Restore task") : _("Delete task");
    let delete_button_icon = is_deleted ? TASK_DELETE_ICON.deleted : TASK_DELETE_ICON.default;

    this.set_subtitle(task_subtitle);
    this.set_tooltip_text(task_tooltip);

    this.set_opacity(task_opacity_level);
    // this.set_activatable(!(is_done || is_deleted))

    this.task_done.set_tooltip_text(checkbox_done_tooltip);
    // this.task_done.set_sensitive(!is_deleted)

    this.task_delete.set_tooltip_text(delete_button_tooltip);
    this.task_delete.set_icon_name(delete_button_icon);
  }

  public get_done(): boolean {
    return this.task_done.get_active();
  }

  public get_project(): string {
    return this._project;
  }

  public notify_task_changed(): void {
    this.emit('task-updated', this)

    this._fire_toast(_("Task updated"))
    this._update_interface()
  }

  public notify_task_activated(): void {
    this._fire_toast(_("Editar no futuro: ") + this.get_title());
  }

  public notify_task_finished(checkbox: any): void {
    const message = checkbox.get_active() ? _("Task finished") : _("Task reopened")

    this._fire_toast(message)
    this._update_interface()

    this.emit('task-updated', this)
    log("task", message)
  }

  public notify_task_deleted(): void {
    this._is_deleted = !this._is_deleted;
    const message = this._is_deleted ? _("Task restored") : _("Task deleted");

    this._fire_toast(message)
    this._update_interface()

    this.emit('task-deleted', this)
    log("task", message)
  }

  private _fire_toast(message: string): void {
    const root = this.get_root() as TasksWindow;
    if (root && root.display_message_toast) {
      root.display_message_toast(message)
    }
  }

  public to_widget(): Task {
    return this;
  }

  public to_object(): ITask {
    return {
      id: this._id,
      title: this.get_title(),
      created_at: this._created_at,
      project: this._project,
      deleted: this._is_deleted,
      done: this.get_done(),
    };
  }
}
