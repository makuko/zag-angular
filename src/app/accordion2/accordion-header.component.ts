import { Component, inject } from '@angular/core';
import { ZagIt } from 'zag-angular';
import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';

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

    protected get value() {
        return this.accordionItem['value'];
    }

    protected get accordionApi() {
        return this.accordion['api'];
    }

    private readonly accordionItem = inject(AccordionItemComponent);

    private readonly accordion = inject(AccordionComponent);

}
