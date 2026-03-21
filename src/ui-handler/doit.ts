import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { DoItSettings } from '../app.enums.js';

import { get_template_path } from '../utils/application.js';
import { log } from '../utils/log-manager.js';
import { get_setting_int, set_setting_int } from '../utils/settings.js';

import * as Actions from '../actions/index.js';

import { TaskListStore } from '../utils/list-store.js';
import { ProjectManager } from '../utils/project-manager.js';
import { PopoverSort } from './popover-sort.js';

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
    ]
};

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

        log(DoItMainWindow.LogClass, "Initializing project manager");
        this.projectManager = new ProjectManager(this.taskListStore);

        this.initialize_actions();

        log(DoItMainWindow.LogClass, "Populating project manager");
        this.projectManager.initialize();

        this.button_sorting = this.get_template_child(DoItMainWindow.GType, 'button_sorting') as Gtk.MenuButton;
        this.button_sorting.set_popover(new PopoverSort());
    }

    private initialize_actions() {
        log(DoItMainWindow.LogClass, "Initializing window actions");

        Actions.backup().setup(this);
        Actions.toast().setup(this);
        Actions.newTask(this.taskListStore).setup(this);
        Actions.sidebar().setup(this);

        Actions.projects(this.taskListStore, this.projectManager).setup(this);
        Actions.projectSidebar(this.taskListStore, this.projectManager).setup(this);
    }

    public override vfunc_close_request(): boolean {
        this.save_window_size();
        this.persist_tasks();

        log(DoItMainWindow.LogClass, "Disposing main window");
        return super.vfunc_close_request();
    }

    private save_window_size() {
        log(DoItMainWindow.LogClass, "Saving window size before closing");
        const [width, height] = this.get_default_size();
        set_setting_int(DoItSettings.windowWidth, width);
        set_setting_int(DoItSettings.windowHeight, height);
    }

    private persist_tasks() {
        log(DoItMainWindow.LogClass, "Persisting tasks");
        this.taskListStore.persist_store();
    }

}