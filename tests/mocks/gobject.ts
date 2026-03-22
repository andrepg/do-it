export default {
  Object: class {
    static registerClass(config: any, target: any) {}
    connect(signal: string, callback: Function) { return 1; }
    disconnect(id: number) {}
    emit(signal: string, ...args: any[]) {}
  },
  TYPE_STRING: 'string',
};
