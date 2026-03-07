import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { DoItMainWindow } from "../ui-handler/doit.js";

/**
 * Retrieves the split_view template child from the window.
 * Returns null and logs an error if the widget is not found.
 */
const getSplitView = (window: DoItMainWindow): Adw.OverlaySplitView | null => {
    const splitView = window.get_template_child(DoItMainWindow.GType, 'split_view') as Adw.OverlaySplitView;

    if (!splitView) {
        console.error('[action] sidebar: failed to get split_view object');
        return null;
    }

    return splitView;
}

/**
 * Retrieves the open-sidebar button from the template.
 * Returns null and logs an error if the widget is not found.
 */
const getOpenButton = (window: DoItMainWindow): Gtk.Button | null => {
    const button = window.get_template_child(DoItMainWindow.GType, 'button_open_sidebar') as Gtk.Button;

    if (!button) {
        console.error('[action] sidebar: failed to get button_open_sidebar');
        return null;
    }

    return button;
}

export default function sidebar() {
    /**
     * Action: win.open-sidebar
     * Shows the sidebar panel.
     */
    const setupOpen = (window: DoItMainWindow) => {
        const action = new Gio.SimpleAction({ name: 'open-sidebar' });

        action.connect('activate', () => {
            getSplitView(window)?.set_show_sidebar(true);
        });

        window.add_action(action);
    }

    /**
     * Action: win.collapse-sidebar
     * Hides the sidebar panel.
     */
    const setupCollapse = (window: DoItMainWindow) => {
        const action = new Gio.SimpleAction({ name: 'collapse-sidebar' });

        action.connect('activate', () => {
            getSplitView(window)?.set_show_sidebar(false);
        });

        window.add_action(action);
    }

    /**
     * Binds the open button's visibility to the inverse of show-sidebar.
     * The button is visible only when the sidebar is closed.
     */
    const bindOpenButtonVisibility = (window: DoItMainWindow) => {
        const splitView = getSplitView(window);
        const openButton = getOpenButton(window);

        if (!splitView || !openButton) return;

        // Sync helper — button visible iff sidebar is NOT shown
        const sync = () => { openButton.visible = !splitView.show_sidebar; };

        sync();
        splitView.connect('notify::show-sidebar', sync);
    }

    const setup = (window: DoItMainWindow) => {
        setupOpen(window);
        setupCollapse(window);
        bindOpenButtonVisibility(window);
    }

    return {
        setup,
    }
}