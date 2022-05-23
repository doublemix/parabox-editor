type KeyComputer<K, V> = (item: V) => K;

export class KeyedMap<K, V> extends Map<K, V> {
  keyComputer: KeyComputer<K, V>;
  constructor(keyComputer: KeyComputer<K, V>, ...args: any[]) {
    super(...args);
    this.keyComputer = keyComputer;
  }
  getByValue(value: V) {
    const key = this.keyComputer.call(undefined, value);
    if (this.has(key)) {
      return this.get(key);
    }
    return undefined;
  }
  setByValue(value: V) {
    const key = this.keyComputer.call(undefined, value);
    this.set(key, value);
  }
  deleteByValue(value: V) {
    const key = this.keyComputer.call(undefined, value);
    this.delete(key);
  }
}
