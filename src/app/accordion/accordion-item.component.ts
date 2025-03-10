import {
    AfterContentInit,
    afterNextRender,
    Component,
    computed,
    contentChild,
    effect,
    inject,
    Injector,
    input,
    runInInjectionContext,
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
export class AccordionItemComponent implements AfterContentInit {

    public readonly value = input(createId());

    private readonly id!: string;

    private readonly accordionApi!: Signal<AccordionApi>;

    private readonly collapsibleApi!: Signal<collapsible.Api>;

    private readonly header = contentChild.required(AccordionHeaderComponent);

    private readonly content = contentChild.required(AccordionContentComponent);

    private readonly injector = inject(Injector);

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.zagIt.next = computed(() => this.accordionApi().getItemProps({ value: this.value() }));

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
        });
    }

    public ngAfterContentInit() {
        runInInjectionContext(this.injector, () => {
            const value = this.value;

            const collapsibleService = useMachine(
                collapsible.machine,
                computed(() => ({
                    id: value(),
                    ids: {
                        content: `accordion:${ this.id }:content:${ value() }`
                    },
                    defaultOpen: this.accordionApi().getItemState({ value: value() }).expanded
                }))
            );

            // @ts-expect-error Initialization
            this.collapsibleApi = computed(() => collapsible.connect(collapsibleService, normalizeProps));

            // @ts-expect-error Initialization
            effect(() => this.content().collapsibleApi.set(this.collapsibleApi()));

            afterNextRender(() => this.collapsibleApi().measureSize());

            effect(() => {
                const accordionApi = this.accordionApi();

                untracked(() => this.collapsibleApi().setOpen(accordionApi.getItemState({ value: value() }).expanded));
            });
        });
    }

}
