import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class Persistence {
  private filename: string = 'data.json';
  private databaseDir: string;
  private databaseFile: Gio.File;
  private databaseFilePath: string | null;

  constructor() {
    this.databaseDir = GLib.get_user_data_dir() as string;

    const dbPath = GLib.build_filenamev([
      this.databaseDir,
      this.filename,
    ]) as string;

    this.databaseFile = Gio.File.new_for_path(dbPath);
    this.databaseFilePath = this.databaseFile.get_path();
  }

  create_database() {
    try {
      Gio.File.new_for_path(this.databaseDir).make_directory_with_parents(null);
    } catch { }

    if (this.databaseFilePath) {
      try {
        Gio.File.new_for_path(this.databaseFilePath).create(Gio.FileCreateFlags.PRIVATE, null);
      } catch { }
    }
  }

  /**
   * Reads data from database file, creating it first if does not exists.
   *
   * @returns {any[]} Returns the data read from the file.
   */
  read_database(): any[] {
    this.create_database();

    const decoder = new TextDecoder();

    let [_, content] = this.databaseFile.load_contents(null);

    const file_content = decoder.decode(content);

    // Note: In modern GJS, GLib.free might not be necessary for JS objects
    // but we keep it if it was in the original code.

    return file_content.trim() == ""
      ? []
      : JSON.parse(file_content);
  }

  write_database(data: any[]) {
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
