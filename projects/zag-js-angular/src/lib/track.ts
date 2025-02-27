import { effect, isSignal, Signal } from '@angular/core';
import { isEqual } from '@zag-js/utils';

export function access<T>(value: T | Signal<T>): T {
    return isSignal(value) ? value() : value;
}

export const track = (deps: any[], _effect: VoidFunction) => {
    let prevDeps: any[] = [];
    let isFirstRun = true;

    effect(() => {
        if (isFirstRun) {
            prevDeps = deps.map(d => access(d));
            isFirstRun = false;

            return;
        }

        let changed = false;

        for (let i = 0; i < deps.length; i++) {
            if (!isEqual(prevDeps[i], access(deps[i]))) {
                changed = true;

                break;
            }
        }

        if (changed) {
            prevDeps = deps.map(d => access(d));

            _effect();
        }
    });
};
