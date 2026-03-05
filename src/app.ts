import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { DoItMainWindow } from './ui-handler/doit.js';
import { is_development_mode } from './utils/application.js';
import { log } from './utils/log-manager.js';
import * as Actions from './actions/index.js';

const options = { GTypeName: "DoitApplication" };

export class DoitApplication extends Adw.Application {
    static readonly LogClass = 'app';

    static {
        GObject.registerClass(options, this);
    }

    constructor() {
        super({ flags: Gio.ApplicationFlags.DEFAULT_FLAGS });

        log(DoitApplication.LogClass, "Initializing application actions");
        Actions.about().setup(this);
        Actions.quit().setup(this);
    }

    public override vfunc_activate(): void {
        let { active_window } = this;

        if (!active_window) {
            log(DoitApplication.LogClass, "Creating main window");
            active_window = new DoItMainWindow(this);
        }

        if (is_development_mode()) {
            log(DoitApplication.LogClass, "Development mode enabled");
            active_window.add_css_class('devel');
        }

        active_window.present();
    }

    public override vfunc_shutdown(): void {
        log(DoitApplication.LogClass, "Shutting down application");
        super.vfunc_shutdown();
    }
}
