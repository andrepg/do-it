import { ITask } from "../app.types.js"
import { TaskListStore } from "../utils/list-store.js"

export const useTasks = (listStore: TaskListStore) => {
    const allTasks: ITask[] = listStore.get_all()


    return {

    }
}