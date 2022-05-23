import type { Ref } from "vue";
import * as Vue from "vue";
import type { Level, Room } from "./levels";
import type { State } from "@/types";

export function createContext<T>(defaultValue?: T) {
  const hasDefault = arguments.length >= 1;
  const symbol = Symbol();
  return {
    provide(value: T) {
      Vue.provide(symbol, value);
    },
    inject(myDefault?: T) {
      const passedDefault = arguments.length >= 1;
      return Vue.inject(
        symbol,
        (passedDefault
          ? myDefault
          : hasDefault
          ? defaultValue
          : Vue.computed(() => {
              throw new Error("no default");
            })) as T
      );
    },
  };
}

export const roomContext = createContext<Ref<Room>>();
export const levelContext = createContext<Level>();
export const stateContext = createContext<State>();
