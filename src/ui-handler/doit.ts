import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { DoItSettings } from '../app.enums.js';

import { get_template_path } from '../utils/application.js';
import { log } from '../utils/log-manager.js';
import { get_setting_int, set_setting_int, set_setting_string } from '../utils/settings.js';

import * as Actions from '../actions/index.js';

import { TaskListStore } from './task-list-store.js';
import { ProjectManager } from '../utils/project-manager.js';
import { PopoverSort } from './popover-sort.js';
import { SortingModeSchema } from '../app.enums.js';
import { useTaskSort } from '../hooks/tasks.sort.js';

const options = {
  GTypeName: "DoItMainWindow",
  Template: get_template_path('ui/window-v2.ui'),
  InternalChildren: [
    "toast_overlay",
    "split_view",
    "task_new_entry",

    // Top menu
    "button_open_sidebar",
    "button_new_task",

    // Content (sidebar and main)
    "list_container",
    "sidebar_project_list",
    "button_sorting"
  ],

  Signals: {
    "sorting-changed": {}
  }
};

/**
 * The main application window for Do It.
 * 
 * Manages the top-level UI components, including the sidebar and the main content area.
 * Also initializes global actions and connects to the global task store and project manager.
 */
export class DoItMainWindow extends Adw.ApplicationWindow {
  static readonly LogClass = 'window';

  static readonly GType = DoItMainWindow as unknown as GObject.GType;

  taskListStore!: TaskListStore;
  projectManager!: ProjectManager;

  private button_sorting!: Gtk.MenuButton;

  static {
    GObject.registerClass(options, this);
  }

  constructor(application: Adw.Application) {
    super({
      application,
      title: "Do It",
      defaultWidth: get_setting_int(DoItSettings.windowWidth),
      defaultHeight: get_setting_int(DoItSettings.windowHeight),
    });

    log(DoItMainWindow.LogClass, "Initializing task store");
    this.taskListStore = new TaskListStore();
    this.taskListStore.load();

    this.initialize_actions();
    this.initialize_project_manager()

    this.button_sorting = this.get_template_child(DoItMainWindow.GType, 'button_sorting') as Gtk.MenuButton;
    this.button_sorting.set_popover(new PopoverSort(this));

    this.connect('sorting-changed', () => this.taskListStore.sort_list());
  }

  private initialize_project_manager(): void {
    log(DoItMainWindow.LogClass, "Initializing project manager");

    this.projectManager = new ProjectManager(this.taskListStore);

    Actions.projects(this.taskListStore, this.projectManager).setup(this);
    Actions.projectSidebar(this.projectManager).setup(this);

    this.projectManager.refresh_items();
  }

  private initialize_actions() {
    log(DoItMainWindow.LogClass, "Initializing window actions");

    Actions.backup().setup(this);
    Actions.toast().setup(this);
    Actions.newTask(this.taskListStore).setup(this);
    Actions.purgeDeleted(this.taskListStore).setup(this);
    Actions.sidebar().setup(this);
  }

  public override vfunc_close_request(): boolean {
    log(DoItMainWindow.LogClass, "Disposing main window");

    const [width, height] = this.get_default_size();

    log(DoItMainWindow.LogClass, "Saving window size before closing");
    set_setting_int(DoItSettings.windowWidth, width);
    set_setting_int(DoItSettings.windowHeight, height);

    log(DoItMainWindow.LogClass, "Persisting tasks");
    this.taskListStore.persist_store();

    return super.vfunc_close_request();
  }
}