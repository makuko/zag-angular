import { Component, computed, type Signal } from '@angular/core';
import * as tooltip from '@zag-js/tooltip';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-js-angular';

@Component({
    selector: 'app-tooltip',
    standalone: true,
    imports: [ZagIt],
    template: `
        <button [zagIt]='api().getTriggerProps()'>Hover me</button>
        @if (api().open) {
            <div [zagIt]='api().getPositionerProps()'>
                <div [zagIt]='api().getContentProps()'>Tooltip</div>
            </div>
        }
    `
})
export class TooltipComponent {

    api: Signal<tooltip.Api>;

    constructor() {
        const service = useMachine(tooltip.machine, { id: createId() });

        this.api = computed(() => tooltip.connect(service, normalizeProps));
    }

}
