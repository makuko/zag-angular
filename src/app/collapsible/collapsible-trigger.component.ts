import { Component, Signal } from '@angular/core';
import { Api as CollapsibleApi } from '@zag-js/collapsible';
import { ZagIt } from 'zag-js-angular';

@Component({
    selector: 'app-collapsible-trigger',
    standalone: true,
    imports: [ZagIt],
    template: `
        <button [zagIt]="api().getTriggerProps()">
            <ng-content/>
        </button>
    `,
    styles: `
        :host {
            display: contents;
        }
    `,
})
export class CollapsibleTriggerComponent {

    public readonly api!: Signal<CollapsibleApi>;

}
