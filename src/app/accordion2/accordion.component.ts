import { Component, computed, inject, input, model, Signal } from '@angular/core';
import * as accordion from '@zag-js/accordion';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';

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

    private readonly api: Signal<accordion.Api>;

    private readonly zagIt = inject(ZagIt);

    constructor() {
        const service = useMachine(
            accordion.machine,
            computed(() => ({
                id: createId(),
                value: this.value(),
                multiple: this.multiple(),
                collapsible: this.collapsible(),
                onValueChange: ({ value }) => this.value.update(() => value)
            }))
        );

        this.api = computed(() => accordion.connect(service, normalizeProps));

        this.zagIt.next = computed(() => this.api().getRootProps());
    }

}
