import Adw1 from "gi://Adw";
import Gio from "gi://Gio";
import { TaskListStore } from "../ui-handler/task-list-store.js";

const purgeDeleted = (taskListStore: TaskListStore) => {
    const setup = (window: Adw1.ApplicationWindow) => {
        const action = new Gio.SimpleAction({ name: "purge_deleted_tasks" });

        action.connect("activate", () => taskListStore.purge_deleted());

        window.add_action(action);
    }

    return { setup }
}

export default purgeDeleted;