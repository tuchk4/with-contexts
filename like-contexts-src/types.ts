export type ArgumentTypes<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

export type IInstance<T = any> = T;
export type IFunction = (...args: any[]) => any;

export type IAttachContext = <F extends IFunction = IFunction>(
  func: F,
  instance: IInstance
) => (...args: ArgumentTypes<F>) => ReturnType<F>;

export interface IContext<T extends IFunction = IFunction> {
  Provider<R extends IFunction = IFunction>(main: R): ReturnType<R>;
  Consumer(): ReturnType<T>;
  attach: IAttachContext;
  replaceFactory(factory: T): void;
}

export interface IContainer<T extends IFunction = IFunction> {
  instance?: IInstance<ReturnType<T>>;
  inProgress: boolean;
}
