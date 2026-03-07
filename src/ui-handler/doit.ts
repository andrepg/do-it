import Adw from 'gi://Adw'
import GObject from 'gi://GObject'

import { DoItSettings } from '../app.enums.js';

import { APPLICATION_ID, get_template_path } from '../utils/application.js';
import { get_setting_int, set_setting_int } from '../utils/settings.js';

import * as Actions from '../actions/index.js';

import { log } from '../utils/log-manager.js';
import { TaskListStore } from '../utils/list-store.js';
import { CreateTaskList } from './task-list.js';

const options = {
    GTypeName: "DoItMainWindow",
    Template: get_template_path('ui/application.ui'),
    InternalChildren: [
        "toast_overlay",
        "group_list",
        "split_view",
        "button_open_sidebar"
    ]
};

export class DoItMainWindow extends Adw.ApplicationWindow {
    static readonly LogClass = 'window';

    static readonly GType = DoItMainWindow as unknown as GObject.GType;

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

        Actions.backup().setup(this);
        Actions.sidebar().setup(this);
    }

    public override vfunc_close_request(): boolean {
        log(DoItMainWindow.LogClass, "Saving window size before closing");

        const [width, height] = this.get_default_size();
        set_setting_int(DoItSettings.windowWidth, width);
        set_setting_int(DoItSettings.windowHeight, height);

        return super.vfunc_close_request();
    }
}