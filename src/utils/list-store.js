import GObject from "gi://GObject";
import Gio from "gi://Gio"
import { Task } from "../ui-handler/task.js";

export const TaskListStore = GObject.registerClass({
    GTypeName: "TaskListStore",
    Properties: {},
    InternalChildren: [],
    Signals: {},
}, class TaskListStoreObject extends Gio.ListStore 
{
    _init() {
        super._init({ item_type: Task });
    }    

    get_all() {
        const items = [];

        for (let index = 0; index < this.get_count(); index++) {
            items.push(this.get_item(index).to_object());
        }

        return items;
    }
    
    get_count() {
        return this.n_items;
    }
});