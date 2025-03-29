import {
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    OnDestroy,
    Renderer2,
    RendererStyleFlags2
} from '@angular/core';
import { isEqual, isNumber, isString } from '@zag-js/utils';
import { Dict, StyleObject } from './normalize-props';

@Directive({
    selector: '[zagIt]',
    standalone: true
})
export class ZagIt implements OnDestroy {

    public readonly props = input<Dict>({}, { alias: 'zagIt' });

    public next = computed(() => this.props());

    private prev: Dict = {};

    private readonly listeners = new Map<string, VoidFunction>();

    private renderer = inject(Renderer2);

    private elementRef = inject(ElementRef<HTMLElement>);

    constructor() {
        effect(() => {
            const prev = this.prev;
            const next = this.prev = this.next();

            if (!isEqual(prev, next)) {
                this.handleAttrs(prev, next);
            }
        });
    }

    public ngOnDestroy() {
        for (const listener of this.listeners.values()) {
            listener();
        }
    }

    private handleAttrs(prev: Dict, next: Dict) {
        const { listeners, elementRef, renderer } = this;
        const el = elementRef.nativeElement;

        for (const [name, value] of Object.entries(prev)) {
            if (name in next) {
                continue;
            }

            if (name.startsWith('on')) {
                listeners.get(name)!();

                continue;
            }

            switch (name) {
                case 'class':
                    this.removeClass(value as string);

                    continue;

                case 'style':
                    this.removeStyle(value as StyleObject);

                    continue;

                case 'value':
                    renderer.setProperty(el, 'value', undefined);

                    continue;

                case 'textContent':
                    renderer.setProperty(el, 'textContent', '');

                    continue;

                case 'checked':
                    renderer.setProperty(el, 'checked', false);

                    continue;
            }

            renderer.removeAttribute(el, name);
        }

        for (const [name, value] of Object.entries(next)) {
            if (name in prev && value === prev[name]) {
                continue;
            }

            if (name.startsWith('on')) {
                this.addEventListener(name, value as EventListener);

                continue;
            }

            switch (name) {
                case 'class':
                    this.removeClass(prev[name] as string);
                    this.addClass(value as string);

                    continue;

                case 'style':
                    this.removeStyle(prev[name] as StyleObject);
                    this.addStyle(value as StyleObject);

                    continue;

                case 'value':
                case 'checked':
                case 'textContent':
                    renderer.setProperty(el, name, value);

                    continue;
            }

            if (isString(value) || isNumber(value)) {
                renderer.setAttribute(el, name, `${ value }`);

                continue;
            }

            if (value === true) {
                renderer.setAttribute(el, name, '');
            } else {
                renderer.removeAttribute(el, name);
            }
        }
    }

    private removeClass(names?: string) {
        if (!names) {
            return;
        }

        const { elementRef, renderer } = this;
        const el = elementRef.nativeElement;

        for (const name of names.split(',')) {
            renderer.removeClass(el, name);
        }
    }

    private addClass(names: string) {
        const { elementRef, renderer } = this;
        const el = elementRef.nativeElement;

        for (const name of names.split(',')) {
            renderer.addClass(el, name);
        }
    }

    private removeStyle(style?: StyleObject) {
        if (!style) {
            return;
        }

        const { elementRef, renderer } = this;
        const el = elementRef.nativeElement;

        for (const name of Object.keys(style)) {
            renderer.removeStyle(el, name, RendererStyleFlags2.DashCase);
        }
    }

    private addStyle(style: StyleObject) {
        const { elementRef, renderer } = this;
        const el = elementRef.nativeElement;

        for (const [name, value] of Object.entries(style)) {
            renderer.setStyle(el, name, value, RendererStyleFlags2.DashCase);
        }
    }

    private addEventListener(name: string, callback: EventListener) {
        this.listeners.get(name)?.();

        this.listeners.set(
            name,
            this.renderer.listen(
                this.elementRef.nativeElement,
                name.substring(2),
                event => {
                    callback(event);
                }
            )
        );
    }

}
