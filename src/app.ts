import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { TasksWindow } from './ui-handler/window.js';

// @ts-ignore
import { get_application_id, get_resource_path, is_development_mode } from './utils/application.js';

// Declare global identifiers used locally
declare const pkg: { version: string };
declare function _(id: string): string;

const options = { GTypeName: "DoitApplication" };

export class DoitApplication extends Adw.Application {
    static {
        GObject.registerClass(options, this);
    }

    constructor() {
        super({
            application_id: get_application_id(),
            resource_base_path: get_resource_path(),
            flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
        });

        this.setupAboutDialogAction();
        this.setupQuitAction();
    }

    private setupAboutDialogAction(): void {
        const show_about_action = new Gio.SimpleAction({ name: 'about' });

        show_about_action.connect('activate', () => {
            const aboutDialog = new Adw.AboutDialog({
                application_name: "Do It",
                application_icon: 'io.github.andrepg.Doit',
                developer_name: 'André Paul Grandsire',
                version: pkg.version,
                website: "https://github.com/andrepg/do-it",
                issue_url: "https://github.com/andrepg/do-it/issues",
                support_url: "https://github.com/andrepg/do-it/discussions",
                license_type: Gtk.License.GPL_3_0,
                developers: [
                    'André Paul Grandsire'
                ],
                // Translators: Replace "translator-credits" with your
                // name/username, and optionally an email or URL.
                translator_credits: _("translators-credits"),
                copyright: '© 2025 André Paul Grandsire'
            });

            aboutDialog.present(this.active_window);
        });

        this.add_action(show_about_action);
    }

    private setupQuitAction(): void {
        const quit_action = new Gio.SimpleAction({ name: 'quit' });

        quit_action.connect('activate', () => {
            this.quit();
        });

        this.add_action(quit_action);
        this.set_accels_for_action('app.quit', ['<primary>q']);
    }

    public override vfunc_activate(): void {
        let { active_window } = this;

        if (!active_window) {
            active_window = new TasksWindow(this);
        }

        if (is_development_mode()) {
            active_window.add_css_class('devel');
        }

        active_window.set_title("Do It");

        active_window.present();
    }
}
