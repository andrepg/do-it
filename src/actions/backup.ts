/* backup.ts
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
import Gtk from 'gi://Gtk';
import { log } from '../utils/log-manager.js';
import { Persistence } from '../utils/persistence.js';
import { ITask } from '../app.types.js';
import { ActionNames, AppSignals } from '../app.enums.js';
import { AppLocale } from '../app.strings.js';

/**
 * Provides actions for exporting and importing the task database.
 */
const backup = () => {
  /**
   * Initializes the "export_database" and "import_database" actions.
   *
   * @param parent The main application window.
   */
  const setup = (parent: Adw.ApplicationWindow) => {
    const export_action = new Gio.SimpleAction({ name: ActionNames.ExportDatabase });
    const import_action = new Gio.SimpleAction({ name: ActionNames.ImportDatabase });

    export_action.connect(AppSignals.Activate, () => exportJson(parent));
    import_action.connect(AppSignals.Activate, () => importJson(parent));

    parent.add_action(export_action);
    parent.add_action(import_action);
  };

  const createFileChooser = (title: string) => {
    const dialog = new Gtk.FileDialog({
      title: title,
      modal: true,
      initialName: 'doit-tasks.json',
    });

    return dialog;
  };

  /**
   * Handles the export process by opening a file dialog and saving the DB contents.
   */
  // TODO: Missing toast notifications
  const exportJson = (parent: Adw.ApplicationWindow) => {
    log('backup-manager', 'Exporting database');

    const dialog = createFileChooser(AppLocale.app.backup.export);

    dialog.save(parent, null, (dialog, result) => {
      const tasks = new Persistence().read_database();
      const file = dialog?.save_finish(result);

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(tasks));
        file?.replace_contents(data, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
      } catch (error) {
        console.error(error);
      }
    });
  };

  /**
   * Handles the import process by opening an existing JSON file and overriding the DB.
   */
  // TODO: Missing toast notifications
  const importJson = (parent: Adw.ApplicationWindow) => {
    log('backup-manager', 'Importing database');

    const dialog = createFileChooser(AppLocale.app.backup.import);

    dialog.open(parent, null, (dialog, result) => {
      const file = dialog?.open_finish(result);

      try {
        const decoder = new TextDecoder();
        const [ok, content] = file?.load_contents(null) || [false, null];
        if (!ok || !content) return;
        const tasks = JSON.parse(decoder.decode(content)) as ITask[];
        new Persistence().write_database(tasks);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return {
    setup,
  };
};

export default backup;
