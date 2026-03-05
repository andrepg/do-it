import Adw from "gi://Adw";
import Gio from "gi://Gio";

export default function sidebar() {
    const actionName = 'toggle-sidebar';

    const setup = (window: Adw.ApplicationWindow, sidebar: Adw.NavigationSplitView) => {
        const action = new Gio.SimpleAction({ name: actionName });

        action.connect('activate', () => {
            toggleSidebar(sidebar);
        });

        window.add_action(action);
    }

    const toggleSidebar = (sidebar: Adw.NavigationSplitView) => {
        if (!sidebar) {
            console.error(`[action] ${actionName}: failed to get Sidebar object`);
            return;
        }

        sidebar.set_collapsed(!sidebar.get_collapsed());
    }

    return {
        setup,
    }
}