import { Component } from '@angular/core';
import { createId } from 'zag-angular';
import { AccordionComponent, AccordionContentComponent, AccordionHeaderComponent, AccordionItemComponent } from './accordion2';
import { CollapsibleComponent, CollapsibleContentComponent, CollapsibleTriggerComponent } from './collapsible';
import { MenuComponent } from './menu/menu.compponent';
import { toaster, ToasterComponent } from './toast';
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
        AccordionContentComponent,
        MenuComponent,
        ToasterComponent
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

        <div class="container">
            <app-menu></app-menu>
        </div>

        <div class='container'>
            @if (showAccordion) {
                <app-accordion [multiple]="true" [collapsible]="true" [value]="accordionValue">
                    <app-accordion-item value="item1">
                        <app-accordion-header>
                            Header 1
                        </app-accordion-header>
                        <app-accordion-content>
                            Super awesome content 1.
                        </app-accordion-content>
                    </app-accordion-item>
                    <app-accordion-item value="item2">
                        <app-accordion-header>
                            Header 2
                        </app-accordion-header>
                        <app-accordion-content>
                            Super awesome content 2.
                        </app-accordion-content>
                    </app-accordion-item>
                    <app-accordion-item value="item3">
                        <app-accordion-header>
                            Header 3
                        </app-accordion-header>
                        <app-accordion-content>
                            Super awesome content 3.
                        </app-accordion-content>
                    </app-accordion-item>
                </app-accordion>
            }
        </div>

        <div class="container">
            <button (click)="showAccordion = !showAccordion">Toggle Accordion</button>
            <button (click)="setValue()">Set Value</button>
        </div>

        <div class=container>
            <button (click)="showToast()">Show Toast</button>
        </div>

        <app-toaster/>
    `,
    styles: `
        .container {
            padding: 2em 5em;
        }
    `
})
export class AppComponent {

    public showAccordion = false;

    public accordionValue = ['item1', 'item2'];

    public setValue() {
        this.accordionValue = ['item2'];
    }

    public showToast() {
        toaster.create({
            id: createId(),
            title: 'Data submitted!',
            description: 'The description of the toast.',
            type: 'info'
        });
    }

}
