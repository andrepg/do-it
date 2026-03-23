/* about.ts
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
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

import { ActionNames, AppSignals } from '~/app.enums.js';
import { AppLocale } from '~/app.strings.js';

import { APPLICATION_ID } from '~/utils/application.js';

/**
 * Provides the "about" action to display the application's About Dialog.
 */
const about = () => {
  const actionName = ActionNames.About;

  const dialogProperties: Partial<Adw.AboutDialog.ConstructorProps> = {
    applicationIcon: APPLICATION_ID,
    applicationName: GLib.get_application_name() as string,
    developerName: 'André Paul Grandsire',
    version: pkg.version,
    website: 'https://github.com/andrepg/do-it',
    issueUrl: 'https://github.com/andrepg/do-it/issues',
    supportUrl: 'https://github.com/andrepg/do-it/discussions',
    licenseType: Gtk.License.GPL_3_0,
    developers: ['André Paul Grandsire'],
    // Translators: Replace "translator-credits" with your
    // name/username, and optionally an email or URL.
    translatorCredits: AppLocale.app.about.translatorCredits,
    copyright: '© 2025 André Paul Grandsire',
  };

  /**
   * Initializes the "about" action and connects it to the main window.
   *
   * @param window The main application wrapper instance.
   */
  const setup = (window: Adw.Application) => {
    const aboutActions = new Gio.SimpleAction({ name: actionName });

    aboutActions.connect(AppSignals.Activate, () => {
      const dialog = new Adw.AboutDialog(dialogProperties);
      dialog.present(window.get_active_window() as Adw.Window);
    });

    window.add_action(aboutActions);
  };

  return {
    setup,
  };
};

export default about;
