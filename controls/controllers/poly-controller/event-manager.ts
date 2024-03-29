import {
  DOMTraverse,
  MonoDrag,
} from '@nekobird/rocket';

import {
  PolyController,
} from './poly-controller';

import {
  PolyActionName,
} from './action-manager';

import {
  PolyTriggerMap,
} from './config';

export interface ActionConfigMapEntry {
  action: PolyActionName;
  configProperty: string;
}

export type ActionConfigMapEntries = ActionConfigMapEntry[];

export class EventManager {
  public controller: PolyController;

  public monoDrag: MonoDrag;

  constructor(controller: PolyController) {
    this.controller = controller;
    this.monoDrag = new MonoDrag({
      onDragEnd: this.onDragEnd
    });
  }

  public initialize() {
    if (this.controller.config.listenToKeydown === true) {
      window.addEventListener('keydown', this.eventHandlerKeydown);
    }
  }

  private onDragEnd = event => {
    this.handleOutsideAction(event);

    if (typeof event.downData !== 'object') {
      return;
    }

    const targetDownElement = event.getTargetElementFromData(event.downData);
    if (targetDownElement === false) {
      return;
    }

    const { config } = this.controller;

    const trigger = DOMTraverse.findAncestor(targetDownElement, config.isTrigger, false);
    if (trigger === false) {
      return;
    }

    const triggerMap = config.mapTriggerToAction(trigger as HTMLElement);
    if (triggerMap === false) {
      return;
    }

    this.eventHub(trigger as HTMLElement, triggerMap);
  };

  private eventHub(trigger: HTMLElement, triggerMap: PolyTriggerMap): this {
    const { actionManager, isReady } = this.controller;

    if (isReady === true && actionManager.isRunning === false) {
      actionManager.isRunning = true;

      const action = actionManager.composeActionFromTrigger(trigger, triggerMap);

      actionManager.actionHub(action);
    }

    return this;
  }

  private handleOutsideAction = event => {
    const { config, actionManager, itemManager } = this.controller;

    if (
      config.deactivateAllOnOutsideAction === true
      && actionManager.isRunning === false
    ) {
      const targetDownElement = event.getTargetElementFromData(event.downData);

      const targetUpElement = event.getTargetElementFromData(event.upData);

      if (
        itemManager.isActive === true
        && targetDownElement !== false
        && targetUpElement !== false
        && DOMTraverse.hasAncestor(targetDownElement, itemManager.activeItems) === false
        && DOMTraverse.hasAncestor(targetUpElement, itemManager.activeItems) === false
        && DOMTraverse.findAncestor(targetDownElement, config.isTrigger) === false
      ) {
        this.controller.deactivateAll();

        config.onOutsideAction(this.controller);
      }
    }
  };

  private eventHandlerKeydown = (event: KeyboardEvent) => {
    const { config, actionManager } = this.controller;

    if (
      config.listenToKeydown === true
      && actionManager.isRunning === false
    ) {
      config.onKeydown(event, this.controller);
    }
  };
}
