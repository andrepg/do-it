export default {
  File: {
    new_for_path: (path: string) => ({
      get_path: () => path,
      make_directory_with_parents: () => {},
      create: () => {},
      load_contents: () => [null, new Uint8Array()],
      replace_contents: () => {},
    }),
  },
  FileCreateFlags: {
    PRIVATE: 1,
  },
};
