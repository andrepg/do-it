/* shortcuts.ts
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
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { ActionNames, AppSignals } from '../enums.js';
import { APPLICATION_RES } from '~/utils/application.js';

/**
 * Provides the "shortcuts" action to display the application's Keyboard Shortcuts Dialog.
 */
const shortcuts = () => {
  const actionName = ActionNames.Shortcuts;

  const setup = (window: Adw.Application) => {
    const shortcutsAction = new Gio.SimpleAction({ name: actionName });

    shortcutsAction.connect(AppSignals.Activate, () => {
      const activeWindow = window.get_active_window() as Adw.Window;
      const builder = Gtk.Builder.new_from_resource(`${APPLICATION_RES}/ui/shortcuts-dialog.ui`);
      const dialog = builder.get_object('shortcuts_dialog') as Adw.ShortcutsDialog;

      if (dialog && activeWindow) {
        dialog.present(activeWindow);
      }
    });

    window.add_action(shortcutsAction);
  };

  return { setup };
};

export default shortcuts;
