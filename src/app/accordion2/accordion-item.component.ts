import {
    Component,
    computed,
    contentChild,
    effect,
    inject,
    Injector,
    input,
    OnInit,
    runInInjectionContext,
    signal,
    Signal,
    untracked
} from '@angular/core';
import * as collapsible from '@zag-js/collapsible';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';
import { AccordionContentComponent } from './accordion-content.component';
import { AccordionHeaderComponent } from './accordion-header.component';
import { AccordionComponent } from './accordion.component';

@Component({
    selector: 'app-accordion-item',
    standalone: true,
    template: `
        <ng-content select="app-accordion-header"/>
        <ng-content select="app-accordion-content"/>
    `,
    styles: `
        :host {
            display: block;
        }
    `,
    hostDirectives: [ZagIt]
})
export class AccordionItemComponent implements OnInit {

    private get accordionApi() {
        return this.accordion['api'];
    }

    public readonly value = input(createId());

    private readonly open = signal<boolean | undefined>(undefined);

    private readonly collapsibleApi!: Signal<collapsible.Api>;

    private readonly header = contentChild.required(AccordionHeaderComponent);

    private readonly content = contentChild.required(AccordionContentComponent);

    private readonly accordion = inject(AccordionComponent);

    private readonly zagIt = inject(ZagIt);

    private readonly injector = inject(Injector);

    public ngOnInit() {
        runInInjectionContext(this.injector, () => this.setup());
    }

    private setup() {
        const service = useMachine(
            collapsible.machine,
            computed(() => ({
                id: this.value(),
                ids: {
                    content: this.accordionApi().getItemContentProps({ value: this.value() })['id']
                },
                open: this.open() === undefined
                    ? this.accordionApi().getItemState({ value: this.value() }).expanded
                    : this.open()
            }))
        );

        // @ts-expect-error Initialization
        this.collapsibleApi = computed(() => collapsible.connect(service, normalizeProps));

        this.zagIt.next = computed(() => this.accordionApi().getItemProps({ value: this.value() }));

        effect(() => {
            const open = this.accordionApi().getItemState({ value: this.value() }).expanded;

            if (open === this.open()) {
                return;
            }

            if (open) {
                this.open.set(open);

                return;
            }

            untracked(() => this.collapsibleApi().measureSize());
            queueMicrotask(() => this.open.set(false));
        });

        effect(() => this.header());
        effect(() => this.content());
    }

}
