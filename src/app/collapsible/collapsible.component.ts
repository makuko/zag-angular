import { Component, computed, contentChild, effect, Signal } from '@angular/core';
import * as collapsible from '@zag-js/collapsible';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';
import { CollapsibleContentComponent } from './collapsible-content.component';
import { CollapsibleTriggerComponent } from './collapsible-trigger.component';

@Component({
    selector: 'app-collapsible',
    standalone: true,
    template: `
        <ng-content select="app-collapsible-trigger"/>
        <ng-content select="app-collapsible-content"/>
    `,
    styles: `
        :host {
            display: block;
        }
    `,
    hostDirectives: [ZagIt]
})
export class CollapsibleComponent {

    public readonly id = createId();

    public readonly api: Signal<collapsible.Api>;

    private trigger = contentChild.required(CollapsibleTriggerComponent);

    private content = contentChild.required(CollapsibleContentComponent);

    constructor(zagIt: ZagIt) {
        const service = useMachine(collapsible.machine, { id: this.id, defaultOpen: true });

        this.api = computed(() => collapsible.connect(service, normalizeProps));

        zagIt.next = computed(() => this.api().getRootProps());

        // @ts-expect-error initialization
        effect(() => this.trigger().api = this.api);

        // @ts-expect-error initialization
        effect(() => this.content().api = this.api);
    }

}
