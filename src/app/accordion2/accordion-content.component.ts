import { Component, computed, inject } from '@angular/core';
import { splitProps } from '@zag-js/utils';
import { mergeProps, ZagIt } from 'zag-angular';
import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';

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

    private get value() {
        return this.accordionItem['value'];
    }

    private get collapsibleApi() {
        return this.accordionItem['collapsibleApi'];
    }

    private get accordionApi() {
        return this.accordion['api'];
    }

    private readonly accordionItem = inject(AccordionItemComponent);

    private readonly accordion = inject(AccordionComponent);

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.zagIt.next = computed(() => {
            const collapsibleContentProps = this.collapsibleApi().getContentProps();
            const [, accordionItemContentProps] = splitProps(
                this.accordionApi().getItemContentProps({ value: this.value() }),
                ['hidden', 'data-state']
            );

            return mergeProps(
                collapsibleContentProps,
                accordionItemContentProps
            );
        });
    }

}
