import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class Persistence {
  constructor() {
    this.databaseDir = GLib.get_home_dir().concat(
      "/.local",
      "/share",
      "/br.dev.startap.tasks"
    );

    this.databaseFile = Gio.File.new_for_path(
      GLib.build_filenamev([this.databaseDir, 'data.json'])
    );

    this.databaseFilePath = this.databaseFile.get_path();
  }

  createFileIfNotExists() {
    try {
      Gio.File.new_for_path(this.databaseDir).make_directory_with_parents(null);
    } catch { }

    try {
      Gio.File.new_for_path(this.databaseFilePath).create(Gio.FileCreateFlags.PRIVATE, null);
    } catch { }
  }

  /**
   * Reads data from database file, creating it first if does not exists.
   *
   * @returns {Array} Returns the data read from the file./var/home/andre/Projetos/Tasks/src/task.js
   */
  readFromFile() {
    this.createFileIfNotExists();

    const decoder = new TextDecoder('utf-8');

    let [_, content] = this.databaseFile.load_contents(null);

    const file_content = decoder.decode(content);

    return file_content.trim() == ""
      ? []
      : JSON.parse(file_content);
  }

  saveToFile(data) {
    this.createFileIfNotExists();

    const encoder = new TextEncoder('utf-8');
    const file = encoder.encode(JSON.stringify(data));

    const result = this.databaseFile.replace_contents(
      file, // ByteArray to save
      null, // old file etag
      true, // if we should make a backup
      Gio.FileCreateFlags.PRIVATE,
      null,
    );

    GLib.free(this.databaseFile);
  }
}

