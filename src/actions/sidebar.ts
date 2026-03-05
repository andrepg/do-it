import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { DoItMainWindow } from "../ui-handler/doit.js";

export default function sidebar() {
    const actionName = 'toggle-sidebar';

    const setup = (window: DoItMainWindow) => {
        const action = new Gio.SimpleAction({ name: actionName });

        action.connect('activate', () => {
            toggleSidebar(window);
        });

        window.add_action(action);
    }

    const toggleSidebar = (window: DoItMainWindow) => {
        const sidebar = window.get_template_child(DoItMainWindow.GType, 'split_view') as Adw.OverlaySplitView;

        if (!sidebar) {
            console.error(`[action] ${actionName}: failed to get Sidebar object`);
            return;
        }

        sidebar.set_show_sidebar(!sidebar.get_show_sidebar());
    }

    return {
        setup,
    }
}