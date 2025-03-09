import { AccordionContentComponent } from './accordion-content.component';
import { AccordionHeaderComponent } from './accordion-header.component';
import { AccordionIndicatorComponent } from './accordion-indicator.component';
import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';

export * from './accordion-content.component';
export * from './accordion-header.component';
export * from './accordion-indicator.component';
export * from './accordion-item.component';
export * from './accordion.component';

export const ACCORDION_COMPONENTS = [
    AccordionComponent,
    AccordionContentComponent,
    AccordionHeaderComponent,
    AccordionIndicatorComponent,
    AccordionItemComponent
] as const;
