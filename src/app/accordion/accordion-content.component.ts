import { Component, computed, Signal } from '@angular/core';
import { Api as AccordionApi } from '@zag-js/accordion';
import { Api as CollapsibleApi } from '@zag-js/collapsible';
import { mergeProps, ZagIt } from 'zag-angular';

@Component({
    selector: 'app-accordion-content',
    standalone: true,
    template: `
        <ng-content/>
    `,
    styles: `
        @keyframes expand {
            from {
                height: 0;
            }
            to {
                height: var(--height);
            }
        }

        @keyframes collapse {
            from {
                height: var(--height);
            }
            to {
                height: 0;
            }
        }

        :host {
            display: block;
            overflow: hidden;
        }

        :host[hidden] {
            display: none;
        }

        :host[data-state=open] {
            animation: expand 0.3s;
        }

        :host[data-state=closed] {
            animation: collapse 0.3s;
        }
    `,
    hostDirectives: [ZagIt]
})
export class AccordionContentComponent {

    private readonly value!: Signal<string>;

    private readonly accordionApi!: Signal<AccordionApi>;

    private readonly collapsibleApi!: Signal<CollapsibleApi>;

    constructor(zagIt: ZagIt) {
        zagIt.next = computed(
            () => mergeProps(
                this.accordionApi().getItemContentProps({ value: this.value() }),
                this.collapsibleApi().getContentProps(),
                { 'data-scope': 'accordion' }
            )
        );
    }

}
