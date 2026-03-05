import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import Gio from 'gi://Gio'

import { log } from './utils/log-manager.js';

const options = {
    GTypeName: "DoItMainWindow",
    Template: "resource:///io/github/andrepg/Doit/Devel/ui/application.ui",
};

export class DoItMainWindow extends Adw.ApplicationWindow {
    static { GObject.registerClass(options, this); }

    constructor(application: Adw.Application) {
        super({
            application,
            default_width: 600,
            default_height: 400,
        });

        log("window", "Initializing application");
    }
}