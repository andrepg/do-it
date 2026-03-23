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
    private filename: string = 'data.json';
    private databaseDir: string;
    private databaseFile: Gio.File;
    private databaseFilePath: string | null;

    constructor() {
        this.databaseDir = GLib.get_user_data_dir() as string;

        const dbPath = GLib.build_filenamev([this.databaseDir, this.filename]) as string;

        this.databaseFile = Gio.File.new_for_path(dbPath);
        this.databaseFilePath = this.databaseFile.get_path();
    }

    /**
     * Ensures that the database directory and file exist, creating them if necessary.
     */
    create_database() {
        try {
            Gio.File.new_for_path(this.databaseDir).make_directory_with_parents(null);
        } catch {
            console.error("[persistence] Error creating database directory");
        }

        if (this.databaseFilePath) {
            try {
                Gio.File.new_for_path(this.databaseFilePath).create(
                    Gio.FileCreateFlags.PRIVATE,
                    null,
                );
            } catch {
                console.error("[persistence] Error creating database file");
            }
        }
    }

    /**
     * Reads data from database file, creating it first if does not exists.
     *
     * @returns {ITask[]} Returns the data read from the file.
     */
    read_database(): unknown[] {
        this.create_database();

        const decoder = new TextDecoder();

        const [, content] = this.databaseFile.load_contents(null);

        const file_content = decoder.decode(content);

        return file_content.trim() === '' ? [] : JSON.parse(file_content);
    }

    /**
     * Writes the provided data to the JSON database file.
     *
     * @param data The array of data objects to persist.
     */
    write_database(data: unknown[]) {
        this.create_database();

        const encoder = new TextEncoder();
        const file = encoder.encode(JSON.stringify(data));

        this.databaseFile.replace_contents(
            file, // ByteArray to save
            null, // old file etag
            true, // if we should make a backup
            Gio.FileCreateFlags.PRIVATE,
            null,
        );
    }
}
