import { Component, computed, inject, Signal } from '@angular/core';
import { Api as CollapsibleApi } from '@zag-js/collapsible';
import { ZagIt } from 'zag-angular';

@Component({
    selector: 'app-collapsible-content',
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
export class CollapsibleContentComponent {

    private readonly api!: Signal<CollapsibleApi>;

    private readonly zagIt = inject(ZagIt);

    constructor() {
        this.zagIt.next = computed(() => this.api().getContentProps());
    }

}
