import { effect } from '@angular/core';
import { isEqual, isFunction } from '@zag-js/utils';

function access<T>(value: T | (() => T)): T {
    return isFunction(value) ? value() : value;
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
