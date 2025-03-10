import { Component, computed, signal, Signal } from '@angular/core';
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

    private readonly collapsibleApi = signal<CollapsibleApi | undefined>(undefined);

    constructor(zagIt: ZagIt) {
        zagIt.next = computed(() => {
            const accordionContentProps = this.accordionApi().getItemContentProps({ value: this.value() });
            const collapsibleContentProps = this.collapsibleApi()?.getContentProps() ?? {};

            delete accordionContentProps['data-state'];
            delete collapsibleContentProps['data-scope'];

            return mergeProps(accordionContentProps, collapsibleContentProps);
        });
    }

}
