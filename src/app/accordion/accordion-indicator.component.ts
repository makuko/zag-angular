import { Component, computed, inject, Signal } from '@angular/core';
import { Api as AccordionApi } from '@zag-js/accordion';
import { ZagIt } from 'zag-angular';

@Component({
    selector: 'app-accordion-indicator',
    standalone: true,
    template: `
        <ng-content/>
    `,
    hostDirectives: [ZagIt]
})
export class AccordionIndicatorComponent {

    private readonly value!: Signal<string>;

    private readonly accordionApi!: Signal<AccordionApi>;

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.zagIt.next = computed(() => this.accordionApi().getItemIndicatorProps({ value: this.value() }));
    }

}
