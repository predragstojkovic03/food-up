export const I_CONFIG_SERVICE = Symbol('I_CONFIG_SERVICE');

export interface IConfigService<T = any, R extends boolean = false> {
  get<K extends keyof T>(key: K): T[K] | (R extends true ? never : undefined);
  getOrThrow<K extends keyof T>(key: K): T[K];
}
