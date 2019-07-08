export type ArgumentTypes<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

export type IFactory = (...args: any[]) => any;

export interface IProvider {
  withProvider<T extends any>(main: () => T): T;

  attachContexts<T extends IFactory>(
    func: T
  ): (...args: ArgumentTypes<T>) => ReturnType<T>;

  duplicateContext<T extends IFactory = IFactory>(
    factory: T
  ): (...args: ArgumentTypes<T>) => ReturnType<T>;

  withContext<T extends IFactory = IFactory>(factory: T): ReturnType<T>;

  withValue<T extends IFactory>(factory: T, ...value: ArgumentTypes<T>): void;

  createScope<T extends IFactory>(
    factory: T,
    ...value: ArgumentTypes<T>
  ): Function;
}
