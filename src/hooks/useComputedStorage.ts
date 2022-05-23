import * as Vue from "vue";

import { useEventListener } from "@vueuse/core";

function useComputedStorage<T>(
  key: string,
  initialValue: T,
  storage = localStorage,
  transform = JSON
) {
  const storedValue = storage.getItem(key);
  let value: T;
  if (storedValue == null) {
    value = initialValue;
  } else {
    value = transform.parse(storedValue) as T;
  }
  const _valueRef = Vue.ref(value);
  const valueRef = Vue.computed({
    get: () => _valueRef.value,
    set: (newValue) => {
      _valueRef.value = newValue;
      storage.setItem(key, transform.stringify(_valueRef.value));
    },
  });
  useEventListener(window, "storage", (event) => {
    if (
      event.storageArea === storage &&
      event.key === key &&
      event.newValue !== null // TODO not sure what to do if this is null
    ) {
      valueRef.value = transform.parse(event.newValue);
    }
  });
  return valueRef;
}
