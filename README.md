# Getting Started

This package allows you to use Zag with Angular.

To get Zag running, you'll need to:

1. Install the machine for the component you're interested in. Let's say you
   want to use the `tooltip` machine.

```bash
npm install @zag-js/tooltip
# or
yarn add @zag-js/tooltip
```

2. Install the adapter for Angular.

```bash
npm install zag-angular
# or
yarn add zag-angular
```

> Congrats! You're ready to use tooltip machine in your project.

## Using the machine

Here's an example of the tooltip machine used in an Angular project.

```ts
import { Component, computed, type Signal } from "@angular/core";
import * as tooltip from "@zag-js/tooltip";
import { createId, normalizeProps, useMachine, ZagIt } from "zag-angular";

@Component({
  selector: "app-tooltip",
  standalone: true,
  imports: [ZagIt],
  template: `
    <button [zagIt]="api().getTriggerProps()">Hover me</button>
    @if (api().open) {
      <div [zagIt]="api().getPositionerProps()">
        <div [zagIt]="api().getContentProps()">Tooltip</div>
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
```

Notice that we imported the `ZagIt` directive. This is necessary because Angular
doesn't have "spread props". This directive emulates this behavior and updates all
attributes and event listeners when its input changes.

There's also a `createId` helper function provided that creates unique IDs in case
you need it.

## Using ZagIt as host directive

Sometimes we want to use `ZagIt` as a host directive to use the host element as
a part of the state machine. Since Angular doesn't provide a way to set inputs on
host directives `ZagIt` needs to be injected and the input needs to be provided
in the constructor instead of the template. Here's an example using the collapsible
machine:

```ts
import { Component, computed, inject, type Signal } from "@angular/core";
import * as collapsible from "@zag-js/collapsible";
import { createId, normalizeProps, useMachine, ZagIt } from "zag-angular";

@Component({
  selector: "app-collapsible",
  standalone: true,
  imports: [ZagIt],
  template: `
    <button [zagIt]="api().getTriggerProps()">Collapse Trigger</button>
    <div [zagIt]="api().getContentProps()">Collape Content</div>
  `,
  hostDirectives: [ZagIt]
})
export class CollapsibleComponent {
  api: Signal<collapsible.Api>;
  zagIt = inject(ZagIt);
  constructor() {
    const service = useMachine(collapsible.machine, { id: createId() });

    this.api = computed(() => collapsible.connect(service, normalizeProps));

    this.zagIt.next = computed(() => this.api().getRootProps());
  }
}
```
