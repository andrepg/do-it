import Gio from "gi://Gio"

export class TaskListStore extends Gio.ListStore 
{
    constructor(params) {
        super.constructor(params)
    }

    get count() {
        return this.n_items;
    }
}