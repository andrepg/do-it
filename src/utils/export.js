import { Persistence } from "./persistence.js";
import Gtk from "gi://Gtk"

export async function export_database() {
  const db = new Persistence();
  const data = db.readFromFile();

  const saveDialog = new Gtk.FileChooserNative({
    title: _("Export database"),
    action: Gtk.FileChooserAction.SAVE,
    transient_for: this,
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
      } catch { }

      dialog.destroy();
    }
  });
}
