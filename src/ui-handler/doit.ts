import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { DoItSettings } from '../app.enums.js';

import { get_template_path } from '../utils/application.js';
import { log } from '../utils/log-manager.js';
import { get_setting_int, set_setting_int } from '../utils/settings.js';

import * as Actions from '../actions/index.js';

import { TaskListStore } from '../utils/list-store.js';

const options = {
    GTypeName: "DoItMainWindow",
    Template: get_template_path('ui/window-v2.ui'),
    InternalChildren: [
        "toast_overlay",
        "list_container",
        "split_view",
        "button_open_sidebar",
        "button_new_task",
        "task_new_entry"
    ]
};

export class DoItMainWindow extends Adw.ApplicationWindow {
    static readonly LogClass = 'window';

    static readonly GType = DoItMainWindow as unknown as GObject.GType;

    taskListStore!: TaskListStore;

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

        log(DoItMainWindow.LogClass, "Initializing main window");

        this.taskListStore = new TaskListStore();
        this.taskListStore.load();

        Actions.backup().setup(this);
        Actions.toast().setup(this);
        Actions.newTask().setup(this);
        /*
        Actions.sidebar().setup(this);
        Actions.projects().setup(this);
        */
    }

    public override vfunc_close_request(): boolean {
        log(DoItMainWindow.LogClass, "Saving window size before closing");

        const [width, height] = this.get_default_size();
        set_setting_int(DoItSettings.windowWidth, width);
        set_setting_int(DoItSettings.windowHeight, height);

        return super.vfunc_close_request();
    }
}