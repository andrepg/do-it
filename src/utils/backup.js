import { Persistence } from "./persistence.js";
import Gtk from "gi://Gtk"
import Gio from "gi://Gio"

export async function export_database(parent) {
  const db = new Persistence();
  const data = db.readFromFile();

  const saveDialog = new Gtk.FileChooserNative({
    title: _("Export database"),
    action: Gtk.FileChooserAction.SAVE,
    transient_for: parent,
    modal: true,
  });

  saveDialog.set_current_name("doit-tasks-export.json")

  console.log("Bringing dialog on screen")
  saveDialog.show();

  saveDialog.connect('response', (dialog, response) => {
    if (response == Gtk.ResponseType.ACCEPT) {
      const filePath = dialog.get_file().get_path();

      try {
        const encoder = new TextEncoder("utf-8")
        const blob = encoder.encode(JSON.stringify(data, null, 2))
        const file = Gio.File.new_for_path(filePath)
        file.replace_contents(
          blob,
          null,
          false,
          Gio.FileCreateFlags.REPLACE_DESTINATION,
          null
        )

        parent.display_message_toast(_("Database exported successfully!"));
      } catch (e) {
        parent.display_message_toast(_("Failed to export database!"))
        console.log(e)
      }

      dialog.destroy();
    }
  });
}

export async function import_database(parent) {
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
      const selectedFile = dialog.get_file();
      try {
        const [ok, content] = selectedFile.load_contents(null);
        if (!ok) throw new Error("Failed to load file.");
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(content);
        const importedData = JSON.parse(text);

        const db = new Persistence;
        db.saveToFile(importedData);

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
