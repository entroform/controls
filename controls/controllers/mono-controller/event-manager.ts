import {
  DOMTraverse,
  MonoTap,
} from '@nekobird/rocket';

import {
  MonoController,
} from './mono-controller';

import {
  MonoActionName,
} from './action-manager';

import {
  MonoTriggerMap,
} from './config';

export interface ActionConfigMapEntry {
  action: MonoActionName;
  configProperty: string;
}

export type ActionConfigMapEntries = ActionConfigMapEntry[];

export class EventManager {
  public controller: MonoController;

  public monoTap: MonoTap;

  constructor(controller: MonoController) {
    this.controller = controller;

    this.monoTap = new MonoTap({
      onUp: this.onUp
    });
  }

  public initialize() {
    const { listenToKeydown } = this.controller.config;

    if (listenToKeydown === true) {
      window.addEventListener('keydown', this.eventHandlerKeydown);
    }
  }

  private onUp = (event, story) => {
    this.handleOutsideAction(event);

    const targetDownElement = story.startingEvent.target;

    const { config } = this.controller;

    let trigger = DOMTraverse.findAncestor(targetDownElement, config.isTrigger, false);
    
    if (trigger === false) {
      return;
    }

    trigger = trigger as HTMLElement;

    const triggerMap = config.mapTriggerToAction(trigger);
    if (triggerMap === false) {
      return;
    }

    this.eventHub(trigger, triggerMap);
  };

  private eventHub(trigger: HTMLElement, triggerMap: MonoTriggerMap): this {
    const { actionManager, isReady } = this.controller;

    if (
      isReady === true
      && actionManager.isRunning === false
    ) {
      actionManager.isRunning = true;

      const action = actionManager.composeActionFromTrigger(trigger, triggerMap);

      actionManager.actionHub(action);
    }

    return this;
  }

  private handleOutsideAction = event => {
    const { config, actionManager, itemManager } = this.controller;

    if (
      config.deactivateOnOutsideAction === true
      && actionManager.isRunning === false
    ) {

      const targetDownElement = event.getTargetElementFromData(event.downData);
      const targetUpElement = event.getTargetElementFromData(event.upData);

      if (
        itemManager.isActive === true
        && typeof itemManager.activeItem !== 'undefined'
        && targetDownElement !== false
        && targetUpElement !== false
        && DOMTraverse.hasAncestor(targetDownElement, itemManager.activeItem) === false
        && DOMTraverse.hasAncestor(targetUpElement, itemManager.activeItem) === false
        && DOMTraverse.findAncestor(targetDownElement, config.isTrigger) === false
      ) {
        this.controller.deactivate();

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
