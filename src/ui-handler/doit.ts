import { get_template_path } from '../utils/application.js';

import Adw from 'gi://Adw'
import GObject from 'gi://GObject'

import * as Actions from '../actions/index.js';
import { log } from '../utils/log-manager.js';
import { get_setting_int, set_setting_int } from '../utils/settings.js';
import { DoItSettings } from '../enums.js';
import { TaskListStore } from '../utils/list-store.js';
import Gtk from '@girs/gtk-4.0';
import { CreateTaskList } from './task-list.js';

const options = {
    GTypeName: "DoItMainWindow",
    Template: get_template_path('ui/application.ui'),
    InternalChildren: [
        "toast_overlay",
        "group_list",
        "split_view"
    ]
};

export class DoItMainWindow extends Adw.ApplicationWindow {
    static readonly LogClass = 'window';

    static readonly GType = DoItMainWindow as unknown as GObject.GType;

    mainTaskStore: TaskListStore;
    groupList: Adw.PreferencesGroup;
    splitView: Adw.OverlaySplitView;

    static { GObject.registerClass(options, this); }

    constructor(application: Adw.Application) {
        super({
            application,
            default_width: get_setting_int(DoItSettings.windowWidth),
            default_height: get_setting_int(DoItSettings.windowHeight),
        });

        log(DoItMainWindow.LogClass, "Initializing main window");

        this.groupList = this.get_template_child(DoItMainWindow.GType, 'group_list') as Adw.PreferencesGroup;
        this.splitView = this.get_template_child(DoItMainWindow.GType, 'split_view') as Adw.OverlaySplitView;

        Actions.backup().setup(this);
        Actions.sidebar().setup(this);

        this.mainTaskStore = new TaskListStore();
        this.mainTaskStore.load();

        this.groupList.add(CreateTaskList(this.mainTaskStore));
    }

    public override vfunc_close_request(): boolean {
        log(DoItMainWindow.LogClass, "Saving window size before closing");

        const [width, height] = this.get_default_size();
        set_setting_int(DoItSettings.windowWidth, width);
        set_setting_int(DoItSettings.windowHeight, height);

        return super.vfunc_close_request();
    }
}