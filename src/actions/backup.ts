import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import { export_database, import_database } from '../utils/backup.js';

const backup = () => {
    const setup = (parent: Adw.ApplicationWindow) => {
        const export_action = new Gio.SimpleAction({ name: 'export_database' });
        const import_action = new Gio.SimpleAction({ name: 'import_database' });

        export_action.connect('activate', exportJson.bind(parent));
        import_action.connect('activate', importJson.bind(parent));

        parent.add_action(export_action);
        parent.add_action(import_action);
    }

    const exportJson = (parent: Adw.ApplicationWindow) => export_database(parent);

    const importJson = (parent: Adw.ApplicationWindow) => import_database(parent);

    return {
        setup,
    }
}

export default backup;