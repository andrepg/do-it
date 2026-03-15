import Gtk40 from "gi://Gtk"
import { DoItMainWindow } from "../ui-handler/doit.js"
import { showToast } from "./toast.js"

export const newTask = () => {
    const buttonNewTaskId = 'button_new_task';
    const fieldNewTaskId = 'task_new_entry';

    const getNewTaskButton = (
        window: DoItMainWindow
    ): Gtk40.Button => window.get_template_child(DoItMainWindow.GType, buttonNewTaskId) as unknown as Gtk40.Button

    const getNewTaskField = (
        window: DoItMainWindow
    ): Gtk40.Entry => window.get_template_child(DoItMainWindow.GType, fieldNewTaskId) as unknown as Gtk40.Entry

    const setup = (window: DoItMainWindow) => {
        const buttonNewTask = getNewTaskButton(window);

        const fieldNewTask = getNewTaskField(window);

        buttonNewTask.connect('clicked', () => fieldNewTask.grab_focus())

        fieldNewTask.connect('activate', () => {
            const text = fieldNewTask.get_text().trim();
            if (text.length == 0) return;

            let project = "";
            let parsedText = text;
            const projectMatch = text.match(/@(\S+)/);
            
            if (projectMatch) {
                const rawProject = projectMatch[1];
                project = rawProject.charAt(0).toUpperCase() + rawProject.slice(1).toLowerCase();
                parsedText = text.replace(projectMatch[0], '').trim();
            }
            
            window.taskListStore.append_task({ title: parsedText, project });
            fieldNewTask.set_text('');
            showToast(_('Task created'));
        })
    }

    return {
        setup,
    }
}