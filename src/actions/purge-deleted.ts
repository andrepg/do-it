import Adw1 from "gi://Adw";
import Gio from "gi://Gio";
import { TaskListStore } from "../ui-handler/task-list-store.js";

/**
 * Provides an action to permanently remove soft-deleted tasks from the database.
 * 
 * @param taskListStore The global TaskListStore.
 */
const purgeDeleted = (taskListStore: TaskListStore) => {
    /**
     * Initializes the "purge_deleted_tasks" action and binds it to the main window.
     * 
     * @param window The main application window.
     */
    const setup = (window: Adw1.ApplicationWindow) => {
        const action = new Gio.SimpleAction({ name: "purge_deleted_tasks" });

        action.connect("activate", () => taskListStore.purge_deleted());

        window.add_action(action);
    }

    return { setup }
}

export default purgeDeleted;