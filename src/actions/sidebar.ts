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
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import { ActionNames, AppSignals, WidgetIds } from '~/app.enums.js';
import { DoItMainWindow } from '~/ui-handler/doit.js';

/**
 * Retrieves the split_view template child from the window.
 * Returns null and logs an error if the widget is not found.
 */
const getSplitView = (window: DoItMainWindow): Adw.OverlaySplitView | null => {
  const splitView = window.get_template_child(
    DoItMainWindow.$gtype,
    WidgetIds.WindowSplitView,
  ) as Adw.OverlaySplitView;

  if (!splitView) {
    console.error('[action] sidebar: failed to get split_view object');
    return null;
  }

  return splitView;
};

/**
 * Initializes the win.open-sidebar action which toggles the sidebar panel.
 *
 * AdwOverlaySplitView handles the overlay behavior automatically:
 * - On wide screens (>500sp) the sidebar is visible by default (set via breakpoint).
 * - On narrow screens the sidebar is hidden and toggled on demand via this action.
 * - Clicking outside the sidebar on narrow screens closes it automatically.
 */
export default function sidebar() {
  const setup = (window: DoItMainWindow) => {
    const action = new Gio.SimpleAction({ name: ActionNames.OpenSidebar });

    action.connect(AppSignals.Activate, () => {
      const splitView = getSplitView(window);
      if (splitView) {
        splitView.set_show_sidebar(!splitView.show_sidebar);
      }
    });

    window.add_action(action);
  };

  return {
    setup,
  };
}
