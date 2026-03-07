import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

/**
 * Displays an overlay toast on the currently active window.
 *
 * Resolves the window automatically through the GIO application singleton,
 * so no reference needs to be passed by the caller.
 */
export const showToast = (message: string): void => {
    const app = Gio.Application.get_default() as Adw.Application | null;
    const window = app?.active_window as Adw.ApplicationWindow | null;

    if (!window) {
        console.warn('[toast] no active window found, skipping toast');
        return;
    }

    // Retrieve the overlay from the window's template children
    const toast_overlay = window.get_template_child(
        window.constructor as unknown as GObject.GType,
        'toast_overlay'
    ) as Adw.ToastOverlay | null;

    toast_overlay?.add_toast(new Adw.Toast({ title: message }));
};

/**
 * Action: win.show-toast
 *
 * Registers the show-toast action on the window. The action accepts a
 * string parameter and delegates display to {@link showToast}.
 *
 * Prefer calling showToast() directly from action code.
 * Use activate_action() only when triggering from UI XML or indirect callers:
 *   window.activate_action('show-toast', GLib.Variant.new_string('Hello!'));
 */
export default function toast() {
    const setup = (window: Adw.ApplicationWindow) => {
        const action = new Gio.SimpleAction({
            name: 'show-toast',
            parameter_type: new GLib.VariantType('s'),
        });

        action.connect('activate', (_action, parameter) => {
            if (!parameter) return;
            showToast(parameter.unpack() as string);
        });

        window.add_action(action);
    };

    return { setup };
}
