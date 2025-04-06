import { Component, computed, inject } from '@angular/core';
import { ZagIt } from 'zag-angular';
import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';

@Component({
    selector: 'app-accordion-indicator',
    standalone: true,
    template: `
        <ng-content/>
    `,
    hostDirectives: [ZagIt]
})
export class AccordionIndicatorComponent {

    private get value() {
        return this.accordionItem['value'];
    }

    private get accordionApi() {
        return this.accordion['api'];
    }

    private readonly accordionItem = inject(AccordionItemComponent);

    private readonly accordion = inject(AccordionComponent);

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.zagIt.next = computed(() => this.accordionApi().getItemIndicatorProps({ value: this.value() }));
    }

}
