import { Component } from '@angular/core';
import { CollapsibleComponent, CollapsibleContentComponent, CollapsibleTriggerComponent } from './collapsible';
import { TooltipComponent } from './tooltip/tooltip.component';

@Component({
    selector: 'app-root',
    imports: [CollapsibleComponent, CollapsibleTriggerComponent, CollapsibleContentComponent, TooltipComponent],
    template: `
        <div class='container'>

            <app-collapsible>
                <app-collapsible-trigger>
                    Trigger
                </app-collapsible-trigger>
                <app-collapsible-content>
                    Super important content.
                </app-collapsible-content>
            </app-collapsible>

            <app-tooltip></app-tooltip>
        </div>
    `,
    styles: `
        .container {
            padding: 5em;
        }
    `
})
export class AppComponent { }
