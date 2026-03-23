/* persistence.ts
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
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

/**
 * Handles reading and writing application data to a local JSON file.
 */
export class Persistence {
  private databaseFileName = 'data.json';

  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  private databaseLocation: Gio.File = Gio.File.new_for_path(GLib.get_user_data_dir() as string);

  private databaseFilePath = GLib.build_filenamev([
    this.databaseLocation.get_path() as string,
    this.databaseFileName
  ]) as string;

  private databaseFileHandler = Gio.File.new_for_path(this.databaseFilePath);

  constructor() {
    this.check_database_existence();
  }

  /**
   * Ensures that the database directory and file exist, creating them if necessary.
   */
  check_database_existence() {
    if (!this.databaseLocation?.query_exists(null) || !this.databaseFileHandler?.query_exists(null)) {
      try {
        this.databaseLocation.make_directory_with_parents(null);
        this.databaseFileHandler.create(Gio.FileCreateFlags.PRIVATE, null);
      } catch {
        console.error('[persistence] Error creating database');
      }
    }
  }

  /**
   * Reads data from database file, creating it first if does not exists.
   *
   * @returns {ITask[]} Returns the data read from the file.
   */
  read_database(): unknown[] {
    this.check_database_existence();

    const [, content] = this.databaseFileHandler.load_contents(null);

    const file_content = this.decoder.decode(content).trim();
    return file_content === '' ? [] : (JSON.parse(file_content) ?? []);
  }

  /**
   * Writes the provided data to the JSON database file.
   *
   * @param data The array of data objects to persist.
   */
  write_database(data: unknown[]) {
    this.check_database_existence();

    const file = this.encoder.encode(JSON.stringify(data));

    this.databaseFileHandler.replace_contents(
      file, // ByteArray to save
      null, // old file etag
      true, // if we should make a backup
      Gio.FileCreateFlags.PRIVATE,
      null,
    );
  }
}
