/* main.js
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

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { TasksWindow } from './ui-handler/window.js';
import { get_application_id, get_resource_path, is_development_mode } from './utils/application.js';

pkg.initGettext();
pkg.initFormat();

export const DoitApplication = GObject.registerClass(
  class DoitApplication extends Adw.Application {
    constructor() {
      super({
        application_id: get_application_id(),
        resource_base_path: get_resource_path(),
        flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
      });

      this.setupAboutDialogAction();
      this.setupQuitAction();
    }

    setupAboutDialogAction() {
      const show_about_action = new Gio.SimpleAction({ name: 'about' });

      show_about_action.connect('activate', () => {
        const aboutDialog = new Adw.AboutDialog({
          application_name: "Do It",
          application_icon: 'io.github.andrepg.Doit',
          developer_name: 'André Paul Grandsire',
          version: pkg.version,
          website: "https://github.com/andrepg/do-it",
          issue_url: "https://github.com/andrepg/do-it/issues",
          support_url: "https://github.com/andrepg/do-it/discussions",
          license_type: Gtk.License.GPL_3_0,
          developers: [
            'André Paul Grandsire'
          ],
          // Translators: Replace "translator-credits" with your
          // name/username, and optionally an email or URL.
          translator_credits: _("translators-credits"),
          copyright: '© 2025 André Paul Grandsire'
        });

        aboutDialog.present(this.active_window);
      });

      this.add_action(show_about_action);
    }

    setupQuitAction() {
      const quit_action = new Gio.SimpleAction({ name: 'quit' });

      quit_action.connect('activate', _ => {
        this.quit();
      });

      this.add_action(quit_action);
      this.set_accels_for_action('app.quit', ['<primary>q']);
    }


    vfunc_activate() {
      let { active_window } = this;

      if (!active_window)
        active_window = new TasksWindow(this);

      if (is_development_mode()) {
        active_window.add_css_class('devel')
      }

      active_window.set_title("Do It");

      active_window.present();
    }
  }
);

export function main(argv) {
  return (new DoitApplication()).runAsync(argv);
}
