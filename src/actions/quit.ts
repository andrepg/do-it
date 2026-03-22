import Adw from "gi://Adw";
import Gio from "gi://Gio";

/**
 * Provides the application quit action and keyboard shortcut bindings.
 */
const quit = () => {
    const actionName = 'quit';
    const actionTrigger = 'app.quit';

    /**
     * Initializes the "quit" action and binds the `<Primary>q` shortcut.
     * 
     * @param application The main application wrapper instance.
     */
    const setup = (application: Adw.Application) => {
        const quitAction = new Gio.SimpleAction({
            name: actionName
        });

        quitAction.connect('activate', () => {
            application.quit();
        });

        application.add_action(quitAction);
        application.set_accels_for_action(actionTrigger, ['<Primary>q']);
    }

    return {
        setup
    }
}

export default quit;
