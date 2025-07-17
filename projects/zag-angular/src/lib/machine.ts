import { afterRenderEffect, computed as computedSignal, isSignal, untracked, type Signal } from '@angular/core';
import type {
    ActionsOrFn,
    BindableContext,
    ChooseFn,
    ComputedFn,
    EffectsOrFn,
    GuardFn,
    Machine,
    MachineSchema,
    Params,
    Service,
    Transition,
} from '@zag-js/core';
import { createScope, INIT_STATE, MachineStatus } from '@zag-js/core';
import { compact, ensure, isFunction, isString, toArray, warn } from '@zag-js/utils';
import { bindable } from './bindable';
import { createRefs } from './refs';
import { track } from './track';

export function useMachine<T extends MachineSchema>(
    machine: Machine<T>,
    userProps: Partial<T['props']> | Signal<Partial<T['props']>> = {}
): Service<T> {
    const scope = computedSignal(() => {
        const { id, ids, getRootNode } = access<any>(userProps);

        return createScope({ id, ids, getRootNode });
    });

    const debug = (...args: any[]) => {
        if (machine.debug) {
            console.log(...args);
        }
    };

    const props = computedSignal(
        () => machine.props?.({
            props: compact(access(userProps)),
            scope: scope()
        }) ?? access(userProps)
    );

    const prop = useProp<T['props']>(props);

    const context = machine.context?.({
        prop,
        bindable,
        get scope() {
            return scope();
        },
        flush,
        getContext() {
            return ctx;
        },
        getComputed() {
            return computed;
        },
        getRefs() {
            return refs;
        },
        getEvent() {
            return getEvent();
        }
    });

    // TODO: Make typesafe
    const ctx: BindableContext<T> = {
        get(key) {
            return context?.[key].get() as any;
        },
        set(key, value) {
            context?.[key].set(value);
        },
        initial(key) {
            return context?.[key].initial as any;
        },
        hash(key) {
            const current = context?.[key].get();

            return context?.[key].hash(current as any) as any;
        }
    };

    let effectsRef = new Map<string, VoidFunction>();
    let transitionRef: Transition<any> | null = null;

    let previousEventRef: any = null;
    let eventRef = { type: '' };

    const getEvent = () => ({
        ...eventRef,
        current() {
            return eventRef;
        },
        previous() {
            return previousEventRef;
        }
    });

    const getState = () => ({
        ...state,
        matches(...values: T['state'][]) {
            return values.includes(state.get());
        },
        hasTag(tag: T['tag']) {
            return !!machine.states[state.get()]?.tags?.includes(tag);
        }
    });

    const refs = createRefs(machine.refs?.({ prop, context: ctx }) ?? {});

    const getParams = (): Params<T> => ({
        state: getState(),
        context: ctx,
        event: getEvent(),
        prop,
        send,
        action,
        guard,
        track,
        refs,
        computed,
        flush,
        get scope() {
            return scope();
        },
        choose
    });

    const action = (keys?: ActionsOrFn<T>) => {
        const strs = isFunction(keys) ? keys(getParams()) : keys;

        if (!strs) {
            return;
        }

        const fns = strs.map(s => {
            const fn = machine.implementations?.actions?.[s];

            if (!fn) {
                warn(`[zag-js] No implementation found for action '${ JSON.stringify(s) }'`);
            }

            return fn;
        });

        for (const fn of fns) {
            fn?.(getParams());
        }
    };

    const guard = (str: T['guard'] | GuardFn<T>) => {
        return isFunction(str) ? str(getParams()) : machine.implementations?.guards?.[str](getParams());
    };

    const effect = (keys?: EffectsOrFn<T>) => {
        const strs = isFunction(keys) ? keys(getParams()) : keys;

        if (!strs) {
            return;
        }

        const fns = strs.map((s) => {
            const fn = machine.implementations?.effects?.[s];

            if (!fn) {
                warn(`[zag-js] No implementation found for effect '${ JSON.stringify(s) }'`);
            }

            return fn;
        });

        const cleanups: VoidFunction[] = [];

        for (const fn of fns) {
            const cleanup = fn?.(getParams());

            if (cleanup) {
                cleanups.push(cleanup);
            }
        }

        return () => cleanups.forEach(fn => fn());
    };

    const choose: ChooseFn<T> = transitions => {
        return toArray(transitions).find(t => {
            let result = !t.guard;

            if (isString(t.guard)) {
                result = !!guard(t.guard);
            } else if (isFunction(t.guard)) {
                result = t.guard(getParams());
            }

            return result;
        });
    };

    const computed: ComputedFn<T> = key => {
        ensure(machine.computed, () => `[zag-js] No computed object found on machine`);

        return machine.computed[key]({
            context: ctx,
            event: eventRef,
            prop,
            refs,
            scope: scope(),
            computed
        });
    };

    const state = bindable(() => ({
        defaultValue: machine.initialState({ prop }),
        onChange(nextState, prevState) {
            // compute effects: exit -> transition -> enter

            // exit effects
            if (prevState) {
                const exitEffects = effectsRef.get(prevState);

                exitEffects?.();
                effectsRef.delete(prevState);
            }

            // exit actions
            if (prevState) {
                action(machine.states[prevState]?.exit);
            }

            // transition actions
            action(transitionRef?.actions);

            // enter effect
            const cleanup = effect(machine.states[nextState]?.effects);

            if (cleanup) {
                effectsRef.set(nextState!, cleanup);
            }

            // root entry actions
            if (prevState === INIT_STATE) {
                action(machine.entry);

                const cleanup = effect(machine.effects);

                if (cleanup) {
                    effectsRef.set(INIT_STATE, cleanup);
                }
            }

            // enter actions
            action(machine.states[nextState]?.entry);
        }
    }));

    let status = MachineStatus.NotStarted;

    afterRenderEffect(onCleanup => {
        const started = status === MachineStatus.Started;

        status = MachineStatus.Started;

        debug(started ? 'rehydrating...' : 'initializing...');

        untracked(() => state.invoke(state.initial, INIT_STATE));

        onCleanup(() => {
            debug('unmounting...');

            status = MachineStatus.Stopped;

            effectsRef.forEach(fn => fn());

            effectsRef = new Map();
            transitionRef = null;

            action(machine.exit);
        });
    });

    // TODO: Add EventType
    const send = (event: any) => {
        queueMicrotask(() => {
            if (status !== MachineStatus.Started) {
                return;
            }

            previousEventRef = eventRef;
            eventRef = event;

            debug('send', event);

            const currentState = state.get();

            // @ts-expect-error index signature
            const transitions = machine.states[currentState].on?.[event.type] ?? machine.on?.[event.type];

            const transition = choose(transitions);

            if (!transition) {
                return;
            }

            debug('transition', transition);

            // save current transition
            transitionRef = transition;

            const target = transition.target ?? currentState;
            const changed = target !== currentState;

            if (changed) {
                // state change is high priority
                state.set(target);
            } else if (transition.reenter) {
                // reenter will re-invoke the current state
                state.invoke(currentState, currentState);
            } else {
                // call transition actions
                action(transition.actions);
            }
        });
    };

    machine.watch?.(getParams());

    return {
        state: getState(),
        send,
        context: ctx,
        prop,
        get scope() {
            return scope();
        },
        refs,
        computed,
        event: getEvent(),
        getStatus: () => status
    } as Service<T>;
}

function flush(fn: VoidFunction) {
    fn();
}

function access<T>(value: T | Signal<T>) {
    return isSignal(value) ? value() : value;
}

function useProp<T>(value: Signal<T>) {
    return function get<K extends keyof T>(key: K): T[K] {
        return value()[key];
    };
}
