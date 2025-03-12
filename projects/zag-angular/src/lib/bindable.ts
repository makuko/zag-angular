import { computed, effect, isSignal, signal } from '@angular/core';
import { type Bindable, type BindableParams } from '@zag-js/core';
import { isFunction } from '@zag-js/utils';

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
    const initial = props().value ?? props().defaultValue;

    const eq = props().isEqual ?? Object.is;

    const value = signal(initial as T);
    const controlled = computed(() => props().value !== undefined);

    const valueRef = { current: value() };
    const prevValue: { current: T | undefined; } = { current: undefined };

    effect(() => {
        const v = controlled() ? props().value : value();

        prevValue.current = v;
        valueRef.current = v as T;
    });

    return {
        initial,
        ref: valueRef,
        get(): T {
            const v = (controlled() ? props().value : value);

            return isSignal(v) ? v() : v as T;
        },
        set(v: T | ((prev: T) => T)) {
            const prev = prevValue.current;
            const next = isFunction(v) ? v(valueRef.current) : v;

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
