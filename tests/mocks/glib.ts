import { vi } from 'vitest';

export default {
  get_user_data_dir: () => '/tmp/doit-test',
  build_filenamev: (args: string[]) => args.join('/'),
  idle_add: vi.fn((_priority: number, callback: () => number) => {
    callback();
    return 0;
  }),
  PRIORITY_DEFAULT_IDLE: 0,
  SOURCE_REMOVE: 0,
};
