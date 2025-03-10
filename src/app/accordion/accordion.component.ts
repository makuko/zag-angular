import { Component, computed, contentChildren, effect, inject, input, model, Signal } from '@angular/core';
import * as accordion from '@zag-js/accordion';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
    selector: 'app-accordion',
    standalone: true,
    template: `
        <ng-content select="app-accordion-item"/>
    `,
    hostDirectives: [ZagIt]
})
export class AccordionComponent {

    public readonly value = model<string[]>([]);

    public readonly multiple = input(false);

    public readonly collapsible = input(true);

    private readonly id = createId();

    private readonly api: Signal<accordion.Api>;

    private readonly items = contentChildren(AccordionItemComponent);

    private readonly zagIt = inject(ZagIt);

    constructor() {
        const service = useMachine(
            accordion.machine,
            computed(() => ({
                id: this.id,
                value: this.value(),
                multiple: this.multiple(),
                collapsible: this.collapsible(),
                onValueChange: ({ value }) => this.value.update(() => value)
            }))
        );

        this.api = computed(() => accordion.connect(service, normalizeProps));

        this.zagIt.next = computed(() => this.api().getRootProps());

        effect(() => {
            for (const item of this.items()) {
                // @ts-expect-error Initialization
                item.id = this.id;
                // @ts-expect-error Initialization
                item.accordionApi = this.api;
            }
        });
    }

}
