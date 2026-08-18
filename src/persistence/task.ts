import { ITask } from '~/app.types.js';

class Task implements ITask {
  id?: string | undefined;
  title: string = '';
  created_at: number = Date.now();
  project?: string | undefined;
  deleted?: boolean | undefined = false;
  done?: boolean | undefined = false;

  static from_raw_object = (task: ITask) => new Task(task);

  constructor(params: ITask) {
    this.id = params.id;

    //     this.set_title(params.title);

    //     if (params.project) this.set_project(params.project);
    //     if (params.done) this.finish();
    //     if (params.deleted) this.delete();
  }

  //   set title(title: string) {
  //     this.title = title;
  //   }
  //
  //   set project(project: string) {
  //     this.project = project;
  //   }
  //
  //   set done() {
  //     this.done = true;
  //   }
  //
  //   set deleted() {
  //     this.deleted = true;
  //   }

  to_raw_object = () => ({
    //     id: this.id,
    //     title: this.title,
    //     created_at: this.created_at.getTime(),
    //     project: this.project,
    //     deleted: this.deleted,
    //     done: this.done,
  });
}

export default Task;
