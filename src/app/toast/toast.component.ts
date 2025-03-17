import { Component, computed, inject, Injector, input, runInInjectionContext, Signal } from '@angular/core';
import * as toast from '@zag-js/toast';
import { normalizeProps, useMachine, ZagIt } from 'zag-angular';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [ZagIt],
    template: `
        <span [zagIt]="api().getGhostBeforeProps()"></span>
        <h3 [zagIt]="api().getTitleProps()">
            {{ api().title }}
        </h3>
        <p [zagIt]="api().getDescriptionProps()">
            {{ api().description }}
        </p>
        <button (click)="api().dismiss()">Close</button>
        <span [zagIt]="api().getGhostAfterProps()"></span>
    `,
    styles: `
        :host {
            box-sizing: border-box;
            width: 400px;
            border-radius: .375rem;
            border: 1px solid #ededed;
            padding: 1.5rem;
            box-shadow: 0 5px 10px 0 rgba(0, 0, 0, .12);
            overflow-wrap: anywhere;
            translate: var(--x) var(--y);
            scale: var(--scale);
            z-index: var(--z-index);
            height: var(--height);
            opacity: var(--opacity);
            will-change: translate, opacity, scale;
            transition: translate 400ms, scale 400ms, opacity 400ms;
            transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);
        }

        :host[data-type=info] {
            background: #fff;
            color: black;
        }

        :host[data-state=closed] {
            transition: translate 400ms, scale 400ms, opacity 200ms;
            transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
        }

        [data-scope="toast"][data-part="close-trigger"] {
            display: flex;
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
        }
    `,
    hostDirectives: [ZagIt]
})
export class ToastComponent {

    public readonly toast = input.required<toast.Options>();

    public readonly parent = input.required<toast.GroupService>();

    public readonly index = input.required<number>();

    protected readonly api!: Signal<toast.Api>;

    private readonly zagIt = inject(ZagIt);

    private injector = inject(Injector);

    public ngOnInit() {
        runInInjectionContext(
            this.injector,
            () => {
                const service = useMachine(
                    toast.machine,
                    computed(() => ({
                        ...this.toast(),
                        parent: this.parent(),
                        index: this.index()
                    }))
                );

                // @ts-expect-error Initialization
                this.api = computed(() => toast.connect(service, normalizeProps));

                this.zagIt.next = computed(() => this.api().getRootProps());
            }
        );
    }

}
