/* quit.ts
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
import { ActionNames, AppSignals } from "../app.enums.js";

/**
 * Provides the application quit action and keyboard shortcut bindings.
 */
const quit = () => {
    const actionName = ActionNames.Quit;
    const actionTrigger = 'app.quit';

    /**
     * Initializes the "quit" action and binds the `<Primary>q` shortcut.
     * 
     * @param application The main application wrapper instance.
     */
    const setup = (application: Adw.Application) => {
        const quitAction = new Gio.SimpleAction({
            name: actionName
        });

        quitAction.connect(AppSignals.Activate, () => {
            application.quit();
        });

        application.add_action(quitAction);
        application.set_accels_for_action(actionTrigger, ['<Primary>q']);
    }

    return {
        setup
    }
}

export default quit;
