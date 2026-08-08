export default {
  Object: class {
    static registerClass(config: any, target: any) {}
    connect(signal: string, callback: Function) {
      return 1;
    }
    disconnect(id: number) {}
    emit(signal: string, ...args: any[]) {}
  },
  registerClass: () => {},
  TYPE_STRING: 'string',
  TYPE_OBJECT: 'object',
};
