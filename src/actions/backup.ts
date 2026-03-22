import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk';
import { log } from '../utils/log-manager.js';
import { Persistence } from '../utils/persistence.js';
import { ITask } from '../app.types.js';

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
        const export_action = new Gio.SimpleAction({ name: 'export_database' });
        const import_action = new Gio.SimpleAction({ name: 'import_database' });

        export_action.connect('activate', () => exportJson(parent));
        import_action.connect('activate', () => importJson(parent));

        parent.add_action(export_action);
        parent.add_action(import_action);
    }

    const createFileChooser = (title: string) => {
        const dialog = new Gtk.FileDialog({
            title: title,
            modal: true,
            initialName: "doit-tasks.json",
        });

        return dialog;
    }

    /**
     * Handles the export process by opening a file dialog and saving the DB contents.
     */
    // TODO: Missing toast notifications
    const exportJson = (parent: Adw.ApplicationWindow) => {
        log("backup-manager", "Exporting database");

        const dialog = createFileChooser(_("Export database"));

        dialog.save(parent, null, (dialog, result) => {
            const tasks = (new Persistence).read_database();
            const file = dialog?.save_finish(result);

            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(JSON.stringify(tasks));
                file?.replace_contents(data, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
            } catch (error) {
                console.error(error);
            }
        })
    };

    /**
     * Handles the import process by opening an existing JSON file and overriding the DB.
     */
    // TODO: Missing toast notifications
    const importJson = (parent: Adw.ApplicationWindow) => {
        log("backup-manager", "Importing database");

        const dialog = createFileChooser(_("Import database"));

        dialog.open(parent, null, (dialog, result) => {
            const file = dialog?.open_finish(result);

            try {
                const decoder = new TextDecoder();
                const [ok, content] = file?.load_contents(null) || [false, null];
                if (!ok || !content) return;
                const tasks = JSON.parse(decoder.decode(content)) as ITask[];
                (new Persistence).write_database(tasks);
            } catch (error) {
                console.error(error);
            }
        })
    };

    return {
        setup,
    }
}

export default backup;