import { Component, computed, contentChild, effect, input, Signal, untracked } from '@angular/core';
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
export class AccordionItemComponent {

    public readonly value = input(createId());

    private readonly id!: string;

    private readonly accordionApi!: Signal<AccordionApi>;

    private readonly collapsibleApi: Signal<collapsible.Api>;

    private readonly header = contentChild.required(AccordionHeaderComponent);

    private readonly content = contentChild.required(AccordionContentComponent);

    constructor(zagIt: ZagIt) {
        const value = this.value;

        const collapsibleService = useMachine(
            collapsible.machine,
            computed(() => ({
                id: value(),
                ids: {
                    content: `accordion:${ this.id }:content:${ value() }`
                }
            }))
        );

        this.collapsibleApi = computed(() => collapsible.connect(collapsibleService, normalizeProps));

        zagIt.next = computed(() => this.accordionApi().getItemProps({ value: value() }));

        effect(() => {
            const accordionApi = this.accordionApi();

            untracked(
                () => this.collapsibleApi().setOpen(accordionApi.getItemState({ value: value() }).expanded)
            );
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

}
