import { computed, effect, signal } from '@angular/core';
import { type Bindable, type BindableParams } from '@zag-js/core';
import { isFunction } from '@zag-js/utils';

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
    const initial = props().value ?? props().defaultValue;

    const eq = props().isEqual ?? Object.is;

    const value = signal(initial as T);
    const controlled = computed(() => props().value !== undefined);

    const valueRef = computed(() => controlled() ? props().value! : value());

    return {
        initial,
        ref: valueRef,
        get(): T {
            return valueRef();
        },
        set(v: T | ((prev: T) => T)) {
            const prev = valueRef();
            const next = isFunction(v) ? v(prev) : v;

            if (props().debug) {
                console.log(`[bindable > ${ props().debug }] setValue`, { next, prev });
            }

            if (!controlled()) {
                value.set(next);
            }

            if (!eq(next, prev)) {
                props().onChange?.(next, prev);
            }
        },
        invoke(nextValue: T, prevValue: T) {
            props().onChange?.(nextValue, prevValue);
        },
        hash(value: T) {
            return props().hash?.(value) ?? String(value);
        }
    };
}

bindable.cleanup = (fn: VoidFunction) => {
    effect(onCleanup => onCleanup(fn));
};

bindable.ref = <T>(defaultValue: T) => {
    let value = defaultValue;

    return {
        get: () => value,
        set: (next: T) => {
            value = next;
        }
    };
};
