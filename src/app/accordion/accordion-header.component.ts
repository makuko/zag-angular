import { Component, contentChild, effect, Signal } from '@angular/core';
import { Api as AccordionApi } from '@zag-js/accordion';
import { ZagIt } from 'zag-angular';
import { AccordionIndicatorComponent } from './accordion-indicator.component';

@Component({
    selector: 'app-accordion-header',
    standalone: true,
    imports: [ZagIt],
    template: `
        <button [zagIt]="accordionApi().getItemTriggerProps({ value: value() })">
            <ng-content/>
        </button>
    `
})
export class AccordionHeaderComponent {

    public readonly indicator = contentChild(AccordionIndicatorComponent);

    public readonly value!: Signal<string>;

    public readonly accordionApi!: Signal<AccordionApi>;

    constructor() {
        effect(() => {
            const indicator = this.indicator();

            if (!indicator) {
                return;
            }

            // @ts-expect-error Initialization
            indicator.value = this.value;
            // @ts-expect-error Initialization
            indicator.accordionApi = this.accordionApi;
        });
    }

}
