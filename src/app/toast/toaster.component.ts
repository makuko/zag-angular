import { Component, computed, inject, Signal } from '@angular/core';
import * as toast from '@zag-js/toast';
import { createId, normalizeProps, useMachine, ZagIt } from 'zag-angular';
import { ToastComponent } from './toast.component';
import { toaster } from './toast.store';

@Component({
    selector: 'app-toaster',
    standalone: true,
    imports: [ToastComponent],
    template: `
        @for (toast of api().getToasts(); track toast.id) {
            <app-toast [toast]="toast"
                       [index]="$index"
                       [parent]="service"/>
        }
    `,
    styles: `
        :host {
            flex-direction: column;
            align-items: flex-end;
            z-index: 100;
            inset-inline-end: calc(env(safe-area-inset-right, 0px) + 1rem);
        }
    `,
    hostDirectives: [ZagIt]
})
export class ToasterComponent {

    protected readonly service: toast.GroupService;

    protected readonly api: Signal<toast.GroupApi>;

    private readonly zagIt = inject(ZagIt);

    constructor() {
        toast.group.machine.debug = true;
        this.service = useMachine(
            toast.group.machine,
            {
                id: createId(),
                store: toaster
            }
        );

        this.api = computed(() => toast.group.connect(this.service, normalizeProps));

        this.zagIt.next = computed(() => this.api().getGroupProps());
    }

}
