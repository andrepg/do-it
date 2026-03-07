import { Task } from "../app.types.js"
import { TaskListStore } from "../utils/list-store.js"

export const useTasks = (listStore: TaskListStore) => {
    const allTasks: Task[] = listStore.get_all()


    return {

    }
}