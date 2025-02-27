import { computed, isSignal, type Signal, signal } from '@angular/core';
import { type Bindable, type BindableParams } from '@zag-js/core';
import { isEqual } from '@zag-js/utils';

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
    const initial = props().value ?? props().defaultValue;

    const eq = props().isEqual ?? isEqual;

    const value = signal(initial as T);
    const controlled = computed(() => props().value !== undefined);

    const ref = computed(() => controlled() ? props().value : value());

    const set = (v: T | Signal<T>) => {
        const prev = value();
        const next = isSignal(v) ? v() : v;

        if (props().debug) {
            console.log(`[bindable > ${ props().debug }] setValue`, { next, prev });
        }

        if (!controlled()) {
            value.set(next);
        }

        if (!eq(next, prev)) {
            props().onChange?.(next, prev);
        }
    };

    return {
        initial,
        ref,
        get(): T {
            const v = (controlled() ? props().value : value);

            return isSignal(v) ? v() : v as T;
        },
        set(v: T | Signal<T>) {
            Promise.resolve().then(() => set(v));
        },
        invoke(nextValue: T, prevValue: T) {
            props().onChange?.(nextValue, prevValue);
        },
        hash(value: T) {
            return props().hash?.(value) ?? String(value);
        }
    };
}
