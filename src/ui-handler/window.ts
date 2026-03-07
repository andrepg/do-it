import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { get_template_path } from "../utils/application.js";
import { TaskListStore } from "../utils/list-store.js";
// import { export_database, import_database } from "../utils/backup.js";
import { log } from "../utils/log-manager.js";
// import { CreateTaskList } from "./task-list.js";
import { SortingModes, SortingModeSchema } from "../static.js";
import { get_sorting_label_text } from "../utils/sorting.js";
import { get_setting_int, get_setting_string, set_setting_int } from '../utils/settings.js';

// Redundant local declaration removed (now in env.d.ts)

// import Template from "../../ui/window.ui";

const GObjectProperties = {
  GTypeName: "TasksWindow",
  Template: get_template_path('ui/window.ui'),
  InternalChildren: [
    "task_new_entry",
    "toast_overlay",
    "list_flow_box",
    "button_new_task",
    "task_sort_status_label"
  ],
};

export class TasksWindow extends Adw.ApplicationWindow {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  /**
  * Our list store and persistence handler
  * @private
  */
  private _list_store: TaskListStore;

  // Internal children are mapped to private members with underscore by GObject
  private task_new_entry!: Gtk.Entry;
  private button_new_task!: Gtk.Button;
  private task_sort_status_label!: Gtk.Label;
  private list_flow_box!: Gtk.Box;
  private toast_overlay!: Adw.ToastOverlay;

  private window_actions = [
    { name: 'new_task', event: 'activate', callback: () => this.task_new_entry.grab_focus() },
    { name: 'purge_deleted_tasks', event: 'activate', callback: () => this._list_store.purge_deleted() },
    // { name: 'export_database', event: 'activate', callback: () => export_database(this) },
    // { name: 'import_database', event: 'activate', callback: () => import_database(this) },

    { name: 'sort_by_title', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_TITLE) },
    { name: 'sort_by_status', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_STATUS) },
    { name: 'sort_by_creation_date', event: 'activate', callback: () => this.sort_list_store(SortingModes.BY_DATE) },
  ]

  constructor(application: Adw.Application) {
    super({ application });

    log("window", "Initializing application")

    this.task_new_entry = this.get_template_child(TasksWindow as unknown as GObject.GType, 'task_new_entry') as Gtk.Entry;
    this.button_new_task = this.get_template_child(TasksWindow as unknown as GObject.GType, 'button_new_task') as Gtk.Button;
    this.task_sort_status_label = this.get_template_child(TasksWindow as unknown as GObject.GType, 'task_sort_status_label') as Gtk.Label;
    this.list_flow_box = this.get_template_child(TasksWindow as unknown as GObject.GType, 'list_flow_box') as Gtk.Box;
    this.toast_overlay = this.get_template_child(TasksWindow as unknown as GObject.GType, 'toast_overlay') as Adw.ToastOverlay;

    this._list_store = new TaskListStore();
    this._list_store.load()

    // Connect our main New Task button event with task creation
    this._bind_buttons_actions()

    // Shortcuts to purge and create a new task
    application.set_accels_for_action('win.new_task', ['<Control>n']);
    application.set_accels_for_action('win.purge_deleted_tasks', ['<Control>d']);
    application.set_accels_for_action('win.help_overlay', ['<Control>h']);

    // this.list_flow_box.append(CreateTaskList(this._list_store));

    // this._handle_window_settings();
    this._update_sorting_label();
  }

  public sort_list_store(sorting_mode: string): void {
    this._list_store.sort_list(sorting_mode);

    this._update_sorting_label();
  }

  private _update_sorting_label(): void {
    const current_sort_strategy = get_setting_string(SortingModeSchema.STRATEGY);
    const current_sort_mode = get_setting_string(SortingModeSchema.MODE);

    const current_label_sort_text = get_sorting_label_text(current_sort_mode, current_sort_strategy);

    this.task_sort_status_label.set_markup(`<small>${current_label_sort_text}</small>`);
  }

  private _bind_buttons_actions(): void {
    this.task_new_entry.connect("activate", this._create_task.bind(this));
    this.button_new_task.connect("clicked", () => this.task_new_entry.grab_focus())

    for (const action of this.window_actions) {
      const gio_action = new Gio.SimpleAction({ name: action.name });
      gio_action.connect(action.event, action.callback)

      this.add_action(gio_action);
    }
  }

  // private _handle_window_settings(): void {
  //   this.set_default_size(
  //     get_setting_int('window-width'),
  //     get_setting_int('window-height')
  //   )

  //   this.connect('close-request', () => {
  //     const [width, height] = this.get_default_size();
  //     set_setting_int('window-width', width);
  //     set_setting_int('window-height', height);
  //     return false; // propagate
  //   });
  // }

  /**
   * Add a new task to pending store and persist on disk
   */
  private _create_task(): void {
    const title = this.task_new_entry.get_text();

    if (title.trim() == "") return;

    log("window - new task", "Ask Pending list to add new task");

    this._list_store.append_task({ title: title.trim() });
    this._list_store.persist_store();

    log("window - new task", "Cleaning up interface and inputs");
    this.task_new_entry.set_text("");

    log("window - new task", "Dispatching user feedback");

    this.display_message_toast(
      _("Task %s created").format(title.trim())
    );
  }

  public display_message_toast(message: string): void {
    this.toast_overlay.add_toast(new Adw.Toast({ title: message }))
  }
}
