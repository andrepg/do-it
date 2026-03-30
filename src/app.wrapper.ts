/* app.wrapper.ts
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
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { is_development_mode, APPLICATION_ID, APPLICATION_RES } from './utils/application.js';
import { log } from './utils/log-manager.js';
import * as Actions from './platform/gnome/actions/index.js';

import { DoItMainWindow } from './platform/gnome/views/doit.js';

const options = { GTypeName: 'DoitApplication' };

/**
 * Main application instance responsible for managing the application lifecycle,
 * initializing global actions, and presenting the main window.
 */
export class DoitApplication extends Adw.Application {
  static readonly LogClass = 'app';

  static {
    GObject.registerClass(options, this);
  }

  constructor() {
    super({
      applicationId: APPLICATION_ID,
      resourceBasePath: APPLICATION_RES,
      flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
    });

    log(DoitApplication.LogClass, 'Initializing application actions');

    Actions.about().setup(this);
    Actions.shortcuts().setup(this);
    Actions.quit().setup(this);

    this.set_accels_for_action('app.quit', ['<Ctrl>q']);
    this.set_accels_for_action('win.new-task', ['<Ctrl>n']);
    this.set_accels_for_action('win.toggle-sidebar', ['F9']);
    this.set_accels_for_action('win.task-edit.save', ['<Ctrl>s']);
    this.set_accels_for_action('win.task-edit.close', ['Escape']);
  }

  public override vfunc_activate(): void {
    let { active_window } = this;

    if (!active_window) {
      log(DoitApplication.LogClass, 'Creating main window');
      active_window = new DoItMainWindow(this);
    }

    if (is_development_mode()) {
      log(DoitApplication.LogClass, 'Development mode enabled');
      active_window.add_css_class('devel');
    }

    active_window.present();
  }

  public override vfunc_shutdown(): void {
    log(DoitApplication.LogClass, 'Shutting down application');
    super.vfunc_shutdown();
  }
}
