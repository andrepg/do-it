/* sidebar.ts
 * Copyright 2025 André Paul Grandsire
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { DoItMainWindow } from "../ui-handler/doit.js";
import { ActionNames, AppSignals, WidgetIds } from "../app.enums.js";

/**
 * Retrieves the split_view template child from the window.
 * Returns null and logs an error if the widget is not found.
 */
const getSplitView = (window: DoItMainWindow): Adw.NavigationSplitView | null => {
    const splitView = window.get_template_child(DoItMainWindow.GType, WidgetIds.WindowSplitView) as Adw.NavigationSplitView;

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
    const button = window.get_template_child(DoItMainWindow.GType, WidgetIds.WindowButtonOpenSidebar) as Gtk.Button;

    if (!button) {
        console.error('[action] sidebar: failed to get button_open_sidebar');
        return null;
    }

    return button;
}

/**
 * Initializes global actions required for opening and collapsing the main application sidebar.
 */
export default function sidebar() {
    /**
     * Action: win.open-sidebar
     * Toggles or shows the sidebar panel.
     */
    const setupOpen = (window: DoItMainWindow) => {
        const action = new Gio.SimpleAction({ name: ActionNames.OpenSidebar });

        action.connect(AppSignals.Activate, () => {
            const splitView = getSplitView(window);
            if (splitView) {
                // Toggle collapsed state for Desktop
                splitView.set_collapsed(!splitView.collapsed);
            }
        });

        window.add_action(action);
    }

    /**
     * Action: win.collapse-sidebar
     * Hides the sidebar panel, going back to content tasks.
     */
    const setupCollapse = (window: DoItMainWindow) => {
        const action = new Gio.SimpleAction({ name: ActionNames.CollapseSidebar });

        action.connect(AppSignals.Activate, () => {
            const splitView = getSplitView(window);
            if (splitView) {
                splitView.set_collapsed(true);    // Desktop
            }
        });

        window.add_action(action);
    }

    /**
     * Bootstraps sidebar actions and dynamic UI visibility behaviors.
     */
    const setup = (window: DoItMainWindow) => {
        setupOpen(window);
        setupCollapse(window);

        // Ensure we start showing the tasks content by default
        const splitView = getSplitView(window);
        if (splitView) {
            splitView.set_collapsed(true);
        }
    }

    return {
        setup,
    }
}