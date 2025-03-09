import { Component, computed, Signal } from '@angular/core';
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

    constructor(zagIt: ZagIt) {
        zagIt.next = computed(() => this.accordionApi().getItemIndicatorProps({ value: this.value() }));
    }

}
