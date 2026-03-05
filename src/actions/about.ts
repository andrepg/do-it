import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";
import { APPLICATION_ID } from "../utils/application.js";

const about = () => {
    const actionName = 'about';

    const dialogProperties: Partial<Adw.AboutDialog.ConstructorProps> = {
        applicationIcon: APPLICATION_ID,
        applicationName: GLib.get_application_name() as string,
        developerName: 'André Paul Grandsire',
        version: pkg.version,
        website: "https://github.com/andrepg/do-it",
        issueUrl: "https://github.com/andrepg/do-it/issues",
        supportUrl: "https://github.com/andrepg/do-it/discussions",
        licenseType: Gtk.License.GPL_3_0,
        developers: [
            'André Paul Grandsire'
        ],
        // Translators: Replace "translator-credits" with your
        // name/username, and optionally an email or URL.
        translatorCredits: _("translators-credits"),
        copyright: '© 2025 André Paul Grandsire'
    }

    const setup = (window: Adw.Application) => {
        const aboutActions = new Gio.SimpleAction({ name: actionName });

        aboutActions.connect('activate', () => {
            const dialog = new Adw.AboutDialog(dialogProperties);
            dialog.present(window.get_active_window() as Adw.Window);
        });

        window.add_action(aboutActions);
    }

    return {
        setup
    }
}

export default about;
