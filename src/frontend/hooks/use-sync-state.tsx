import { useState } from "react";

type SyncRef<T> = {
  current: T;
}

export const useSyncState = <T extends any>(initialValue: T): [() => T, (value: T) => void] => {
  const [_internalState, _setInternalState] = useState<SyncRef<T>>({ current: initialValue });

  const setState = (value: T) => {
    // this triggers the re-render...
    _setInternalState({ current: value });
    // ...and this makes the new value immediately available
    _internalState.current = value;
  }

  const getState = () => {
    return _internalState.current;
  }

  return [getState, setState];
} 