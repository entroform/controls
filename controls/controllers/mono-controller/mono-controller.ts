import {
  DOMUtil,
} from '@nekobird/rocket';

import {
  DEFAULT_CONFIG,
  MonoConfig,
} from './config';

import {
  ItemManager,
} from './item-manager';

import {
  EventManager,
} from './event-manager';

import {
  ActionManager,
} from './action-manager';

export class MonoController {
  public config: MonoConfig;

  public itemManager: ItemManager;
  public eventManager: EventManager;
  public actionManager: ActionManager;

  public isReady: boolean = false;

  constructor(config?: Partial<MonoConfig>) {
    this.config = {...DEFAULT_CONFIG};

    this.setConfig(config);

    this.itemManager = new ItemManager(this);
    this.eventManager = new EventManager(this);
    this.actionManager = new ActionManager(this);
  }

  public setConfig(config?: Partial<MonoConfig>): this {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }

    return this;
  }

  public initialize(): this {
    this.itemManager.initialize();

    this.eventManager.initialize();
    
    return this;
  }

  public get isActive(): boolean {
    return this.itemManager.isActive;
  }

  public isItemActive(id: string): boolean {
    const { isActive, activeItem } = this.itemManager;

    if (
      isActive === true
      && DOMUtil.isHTMLElement(activeItem) === true
    ) {
      const activeItemElement = activeItem as HTMLElement;

      return this.config.getItemId(activeItemElement) === id;
    }

    return false;
  }

  public async activate(id: string): Promise<void> {
    try {
      const action = this.actionManager.composeAction('activate', id);

      await this.actionManager.actionHub(action);

      return Promise.resolve();
    } catch {
      return Promise.reject();
    }
  }

  public async deactivate(id?: string): Promise<void> {
    try {
      const action = this.actionManager.composeAction('deactivate', id);

      await this.actionManager.actionHub(action);

      return Promise.resolve();
    } catch {
      return Promise.reject();
    }
  }

  public async toggle(id?: string): Promise<void> {
    try {
      const action = this.actionManager.composeAction('toggle', id);

      await this.actionManager.actionHub(action);

      return Promise.resolve();
    } catch {
      return Promise.reject();
    }
  }
}
