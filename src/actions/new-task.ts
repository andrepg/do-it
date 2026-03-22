import Gtk40 from "gi://Gtk"
import { DoItMainWindow } from "../ui-handler/doit.js"
import { showToast } from "./toast.js"
import { TaskListStore } from "../ui-handler/task-list-store.js"

export const newTask = (store: TaskListStore) => {
    const buttonNewTaskId = 'button_new_task';
    const fieldNewTaskId = 'task_new_entry';

    let fieldNewTask: Gtk40.Entry;

    const get_widget = <T>(window: DoItMainWindow, id: string): T => window.get_template_child(
        DoItMainWindow.GType,
        id
    ) as unknown as T

    const parseProject = (text: string) => {
        let project = "";
        let parsedText = text;
        const projectMatch = text.match(/@(\S+)/);

        if (projectMatch) {
            const rawProject = projectMatch[1];
            project = rawProject.charAt(0).toUpperCase() + rawProject.slice(1).toLowerCase();
            parsedText = text.replace(projectMatch[0], '').trim();
        }

        return { project, parsedText }
    }

    const create_task = (text: string) => {
        const { project, parsedText: title } = parseProject(text);

        store.append_task({
            title,
            created_at: new Date().getTime(),
            project,
        });

        store.persist_store();
    }

    const setup = (window: DoItMainWindow) => {
        const buttonNewTask = get_widget<Gtk40.Button>(window, buttonNewTaskId);
        buttonNewTask.connect('clicked', () => fieldNewTask.grab_focus())

        fieldNewTask = get_widget<Gtk40.Entry>(window, fieldNewTaskId);
        fieldNewTask.connect('activate', handle_user_input)
    }

    const handle_user_input = () => {
        const text = fieldNewTask.get_text().trim();

        if (text.length == 0) return;

        create_task(text);

        fieldNewTask.set_text('');

        showToast(_('Task created'));
    }

    return {
        setup,
    }
}