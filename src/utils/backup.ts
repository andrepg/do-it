import { Persistence } from "./persistence.js";
import Gtk from "gi://Gtk"
import Gio from "gi://Gio"
import { log } from "./log-manager.js";

// Declare _ global for translation
declare function _(id: string): string;

export async function export_database(parent: any) {
  const db = new Persistence();
  const data = db.read_database();

  const saveDialog = new Gtk.FileChooserNative({
    title: _("Export database"),
    action: Gtk.FileChooserAction.SAVE,
    transient_for: parent,
    modal: true,
  });

  saveDialog.set_current_name("doit-tasks-export.json")

  log("backup-manager", "Building export dialog");

  saveDialog.show();

  saveDialog.connect('response', (dialog, response) => {
    log("backup-manager", "Receiving response");

    if (response == Gtk.ResponseType.ACCEPT) {
      const file = (dialog as Gtk.FileChooser).get_file();
      if (!file) return;
      const filePath = file.get_path();
      if (!filePath) return;

      log("backup-manager", `Storing database to ${filePath}`);

      try {
        const encoder = new TextEncoder()
        const blob = encoder.encode(JSON.stringify(data, null, 2))
        const fileObj = Gio.File.new_for_path(filePath)
        fileObj.replace_contents(
          blob,
          null,
          false,
          Gio.FileCreateFlags.REPLACE_DESTINATION,
          null
        )

        log("backup-manager", "File saved successfully")

        parent.display_message_toast(_("Database exported successfully!"));
      } catch (e) {
        parent.display_message_toast(_("Failed to export database!"))
        console.error(e)
      }

      dialog.destroy();
    }
  });
}

export async function import_database(parent: any) {
  const openDialog = new Gtk.FileChooserNative({
    title: _("Import Task Database"),
    action: Gtk.FileChooserAction.OPEN,
    transient_for: parent,
    modal: true
  });

  const filter = new Gtk.FileFilter();
  filter.set_name(_("JSON Files"));
  filter.add_pattern("*.json");
  openDialog.set_filter(filter);

  openDialog.show();

  openDialog.connect('response', (dialog, response) => {
    if (response === Gtk.ResponseType.ACCEPT) {
      const selectedFile = (dialog as Gtk.FileChooser).get_file();
      if (!selectedFile) return;
      try {
        const [ok, content] = selectedFile.load_contents(null);
        if (!ok) throw new Error("Failed to load file.");
        const decoder = new TextDecoder();
        const text = decoder.decode(content);
        const importedData = JSON.parse(text);

        const db = new Persistence();
        db.write_database(importedData);

        parent._list_store.load();
        parent.display_message_toast(_("Database imported successfully"))
      } catch (e) {
        parent.display_message_toast(_("Failed to import database!"))
        console.error(_("Failed to import database!"), e);
      }
    }

    dialog.destroy();
  });
}
