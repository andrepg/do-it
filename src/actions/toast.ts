/* toast.ts
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
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { ActionNames, AppSignals, WidgetIds } from '../app.enums.js';
import { DoItMainWindow } from '../ui-handler/doit.js';

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
        DoItMainWindow.$gtype,
        WidgetIds.WindowToastOverlay
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
            name: ActionNames.ShowToast,
            parameter_type: new GLib.VariantType('s'),
        });

        action.connect(AppSignals.Activate, (_action, parameter) => {
            if (!parameter) return;
            showToast(parameter.unpack() as string);
        });

        window.add_action(action);
    };

    return { setup };
}
