import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import { AppSignals } from '~/app.enums.js';
import { ActionNames } from '~/static/actions.js';
import { TaskListStore } from '~/store/list-store.js';

const purgeFinished = () => {
  const setup = (window: Adw.ApplicationWindow) => {
    const action = new Gio.SimpleAction({ name: ActionNames.PurgeFinishedTasks });

    action.connect(AppSignals.Activate, () => TaskListStore.get_default().purge_finished_tasks());

    window.add_action(action);
  }

  return { setup }
}

export default purgeFinished;
