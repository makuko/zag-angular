import {
    Component,
    computed,
    contentChild,
    effect,
    inject,
    Injector,
    input,
    OnInit,
    runInInjectionContext,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { Api as AccordionApi } from '@zag-js/accordion';
import * as collapsible from '@zag-js/collapsible';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';
import { AccordionContentComponent } from './accordion-content.component';
import { AccordionHeaderComponent } from './accordion-header.component';

@Component({
    selector: 'app-accordion-item',
    standalone: true,
    template: `
        <ng-content select="app-accordion-header"/>
        <ng-content select="app-accordion-content"/>
    `,
    styles: `
        :host {
            display: block;
        }
    `,
    hostDirectives: [ZagIt]
})
export class AccordionItemComponent implements OnInit {

    public readonly value = input(createId());

    private readonly open = signal<boolean | undefined>(undefined);

    private readonly accordionApi!: Signal<AccordionApi>;

    private readonly collapsibleApi!: Signal<collapsible.Api>;

    private readonly collapsibleService!: collapsible.Service;

    private readonly header = contentChild.required(AccordionHeaderComponent);

    private readonly content = contentChild.required(AccordionContentComponent);

    private readonly injector = inject(Injector);

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.collapsibleApi = computed(() => collapsible.connect(this.collapsibleService, normalizeProps));

        this.zagIt.next = computed(() => this.accordionApi().getItemProps({ value: this.value() }));

        effect(() => {
            const open = this.accordionApi().getItemState({ value: this.value() }).expanded;

            if (open === this.open()) {
                return;
            }

            if (open) {
                this.open.set(open);

                return;
            }

            untracked(() => this.collapsibleApi().measureSize());
            queueMicrotask(() => this.open.set(false));
        });

        effect(() => {
            const header = this.header();

            // @ts-expect-error Initialization
            header.value = this.value;
            // @ts-expect-error Initialization
            header.accordionApi = this.accordionApi;
        });

        effect(() => {
            const content = this.content();

            // @ts-expect-error Initialization
            content.value = this.value;
            // @ts-expect-error Initialization
            content.accordionApi = this.accordionApi;
            // @ts-expect-error Initialization
            content.collapsibleApi = this.collapsibleApi;
        });
    }

    public ngOnInit() {
        runInInjectionContext(this.injector, () => {
            // @ts-expect-error Initialization
            this.collapsibleService = useMachine(
                collapsible.machine,
                computed(() => ({
                    id: this.value(),
                    ids: {
                        content: this.accordionApi().getItemContentProps({ value: this.value() })['id']
                    },
                    open: this.open() === undefined
                        ? this.accordionApi().getItemState({ value: this.value() }).expanded
                        : this.open()
                }))
            );
        });
    }

}
