import { CdkPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { Component, computed, effect, Signal, untracked, viewChild } from '@angular/core';
import * as menu from '@zag-js/menu';
import { Dict, normalizeProps, useMachine, ZagIt } from 'zag-angular';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CdkPortal, ZagIt],
    template: `
        <button [zagIt]="fileMenu().getTriggerProps()">
            Click me
            <span [zagIt]="fileMenu().getIndicatorProps()">▾</span>
        </button>

        <ng-template cdkPortal #fileMenuPortal="cdkPortal">
            <div [zagIt]="fileMenu().getPositionerProps()">
                <ul [zagIt]="fileMenu().getContentProps()">
                    @for (item of fileMenuData; track item.value) {
                        <li [attr.key]="item.value"
                            [zagIt]="fileMenu().getItemProps({ value: item.value })">
                            {{ item.label }}
                        </li>
                    }
                    <li [zagIt]="shareMenuTriggerProps()">
                        Share
                        <span [zagIt]="shareMenu().getIndicatorProps()">»</span>
                    </li>
                </ul>
            </div>
        </ng-template>

        <ng-template cdkPortal #shareMenuPortal="cdkPortal">
            <div [zagIt]="shareMenu().getPositionerProps()">
                <ul [zagIt]="shareMenu().getContentProps()">
                    @for (item of shareMenuData; track item.value) {
                        <li [attr.key]="item.value"
                            [zagIt]="shareMenu().getItemProps({ value: item.value })">
                            {{ item.label }}
                        </li>
                    }
                </ul>
            </div>
        </ng-template>
    `,
    styles: `
        [data-scope="menu"][data-part="trigger"] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-align: start;
            cursor: pointer;
            font-weight: 500;
            padding-inline: 1rem;
            padding-block: 0.25rem;
            background: green;
            color: #ffffff;
        }

        [data-scope="menu"][data-part="trigger"]:hover {
            background: darkgreen;
        }

        [data-scope="menu"][data-part="context-trigger"] {
            background: white;
            padding: 1rem;
            border-width: 2px;
            border-style: dashed;
        }

        [data-scope="menu"][data-part="indicator"] {
            margin-left: 0.5rem;
        }

        [data-scope="menu"][data-part="content"] {
            background: white;
            width: 240px;
            padding: 0.5rem;
            isolation: isolate;
            list-style-type: none;
            box-shadow:
                0 1px 3px 0 rgba(0, 0, 0, 0.1),
                0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        [data-scope="menu"][data-part="content"]:is(:focus, [data-focus]) {
            outline: 2px solid hsl(204, 100%, 40%);
        }

        [data-scope="menu"]:is([data-part="item"], [data-part="trigger-item"]) {
            padding-inline: 0.5rem;
            padding-block: 0.25rem;
            cursor: pointer;
        }

        [data-scope="menu"]:is(
            [data-part="item"],
            [data-part="trigger-item"]
        )[data-highlighted] {
            background: darkgreen;
            color: #ffffff;
        }
    `
})
export class MenuComponent {

    fileMenuData = [
        { label: "New tab", value: "new-tab" },
        { label: "New window", value: "new-window" },
        { label: "Print ...", value: "print" },
        { label: "Help", value: "help" },
    ];

    shareMenuData = [
        { label: "Messages", value: "messages" },
        { label: "Airdrop", value: "airdrop" },
        { label: "WhatsApp", value: "whatsapp" },
    ];

    fileMenu: Signal<menu.Api>;

    shareMenu: Signal<menu.Api>;

    shareMenuTriggerProps: Signal<Dict>;

    fileMenuPortal = viewChild.required('fileMenuPortal');

    shareMenuPortal = viewChild.required('shareMenuPortal');

    fileMenuOutlet = new DomPortalOutlet(document.body);

    shareMenuOutlet = new DomPortalOutlet(document.body);

    constructor() {
        menu.machine.debug = true;
        // Level 1 - File Menu
        const fileMenuService = useMachine(
            menu.machine,
            {
                id: '1',
                'aria-label': 'File',
                onInteractOutside(event) {
                    console.log(event);
                }
            }
        );

        this.fileMenu = computed(() => menu.connect(fileMenuService, normalizeProps));

        // Level 2 - Share Menu
        const shareMenuService = useMachine(
            menu.machine,
            {
                id: '2',
                'aria-label': 'Share'
            }
        );

        this.shareMenu = computed(() => menu.connect(shareMenuService, normalizeProps));

        effect(() => {
            untracked(() => {
                this.fileMenu().setChild(shareMenuService);
                this.shareMenu().setParent(fileMenuService);
            });
        });

        // Share menu trigger
        this.shareMenuTriggerProps = computed(() => this.fileMenu().getTriggerItemProps(this.shareMenu()));
    }

    ngAfterViewInit() {
        this.fileMenuOutlet.attach(this.fileMenuPortal());
        this.shareMenuOutlet.attach(this.shareMenuPortal());
    }

    ngOnDestroy() {
        this.fileMenuOutlet.detach();
        this.shareMenuOutlet.detach();
    }

}
