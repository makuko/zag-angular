import { Component } from '@angular/core';
import { AccordionComponent, AccordionContentComponent, AccordionHeaderComponent, AccordionItemComponent } from './accordion';
import { CollapsibleComponent, CollapsibleContentComponent, CollapsibleTriggerComponent } from './collapsible';
import { TooltipComponent } from './tooltip/tooltip.component';

@Component({
    selector: 'app-root',
    imports: [
        CollapsibleComponent,
        CollapsibleTriggerComponent,
        CollapsibleContentComponent,
        TooltipComponent,
        AccordionComponent,
        AccordionHeaderComponent,
        AccordionItemComponent,
        AccordionContentComponent
    ],
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
        </div>

        <div class='container'>
            <app-tooltip></app-tooltip>
        </div>

        <div class='container'>
            <app-accordion>
                <app-accordion-item>
                    <app-accordion-header>
                        Header 1
                    </app-accordion-header>
                    <app-accordion-content>
                        Super awesome content 1.
                    </app-accordion-content>
                </app-accordion-item>
                <app-accordion-item>
                    <app-accordion-header>
                        Header 2
                    </app-accordion-header>
                    <app-accordion-content>
                        Super awesome content 2.
                    </app-accordion-content>
                </app-accordion-item>
                <app-accordion-item>
                    <app-accordion-header>
                        Header 3
                    </app-accordion-header>
                    <app-accordion-content>
                        Super awesome content 3.
                    </app-accordion-content>
                </app-accordion-item>
            </app-accordion>
        </div>
    `,
    styles: `
        .container {
            padding: 2em 5em;
        }
    `
})
export class AppComponent { }
