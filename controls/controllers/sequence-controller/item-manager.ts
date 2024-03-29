import {
  DOMUtil,
} from '@nekobird/rocket';

import {
  SequenceController,
} from './sequence-controller';

export class ItemManager {
  private controller: SequenceController;

  public items: HTMLElement[];

  public activeItem?: HTMLElement;
  public activeIndex?: number;

  public isActive: boolean = false;

  constructor(controller: SequenceController) {
    this.controller = controller;

    this.items = [];
  }

  public initialize(): this {
    this.loadItemsFromConfig();

    this.filterItems();

    this.filterActiveItems();

    return this;
  }

  public loadItemsFromConfig(): this {
    const { config } = this.controller;

    this.items = DOMUtil.toHTMLElementArray(config.items);

    return this;
  }

  public filterItems(): this {
    this.items = this.items.filter(item => this.itemIsValid(item));

    return this;
  }

  private filterActiveItems(): this {
    const { config } = this.controller;

    if (this.items.length > 0) {
      this.items.forEach((item, index) => {
        if (config.itemIsActive(item, this.controller) === true) {
          if (this.isActive === false) {
            this.activeIndex = index;

            this.activeItem = item;

            this.isActive = true;
          } else {
            config.deactivateItem(item, this.controller);
          }
        }
      });

      this.controller.isReady = true;
    }
    return this;
  }

  public itemIsValid(item: HTMLElement): boolean {
    const { config } = this.controller;

    let valid: boolean = true;

    if (typeof config.getItemId(item) !== 'string') {
      valid = false;
    }

    return valid;
  }

  public getItemFromId(id: string): HTMLElement | false {
    const { config } = this.controller;

    let matchedItems: HTMLElement[] = [];

    this.items.forEach(item => {
      if (config.getItemId(item) === id) {
        matchedItems.push(item);
      }
    });

    if (matchedItems.length > 0) {
      return matchedItems[0];
    }

    return false;
  }
}
