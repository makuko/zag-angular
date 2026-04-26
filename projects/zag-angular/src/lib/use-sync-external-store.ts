import { effect, signal, Signal } from '@angular/core';

export function useSyncExternalStore<T>(
    subscribe: (listener: () => void) => () => void,
    getSnapshot: () => T,
    _getServerSnapshot?: () => T,
): Signal<T> {
    const snapshot = signal(getSnapshot());

    effect(onCleanup => {
        snapshot.set(getSnapshot());

        const unsubscribe = subscribe(() => {
            snapshot.set(getSnapshot());
        });

        onCleanup(unsubscribe);
    });

    return snapshot;
}
