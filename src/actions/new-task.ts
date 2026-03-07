import Adw1 from "gi://Adw"
import Gtk40 from "gi://Gtk"
import { DoItMainWindow } from "../ui-handler/doit.js"
import GObject20 from "gi://GObject"
import { showToast } from "./toast.js"

export const newTask = () => {
    const buttonNewTaskId = 'button_new_task';
    const fieldNewTaskId = 'task_new_entry';

    const getNewTaskButton = (
        window: Adw1.ApplicationWindow
    ): Gtk40.Button => window.get_template_child(DoItMainWindow.GType, buttonNewTaskId)

    const getNewTaskField = (
        window: Adw1.ApplicationWindow
    ): Gtk40.Entry => window.get_template_child(DoItMainWindow.GType, fieldNewTaskId)

    const setup = (window: Adw1.ApplicationWindow) => {
        const buttonNewTask = getNewTaskButton(window);

        const fieldNewTask = getNewTaskField(window);

        buttonNewTask.connect('clicked', () => fieldNewTask.grab_focus())

        fieldNewTask.connect('activate', () => {
            showToast(_('Task created'));
        })
    }

    return {
        setup,
    }
}