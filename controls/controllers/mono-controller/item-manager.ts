import {
  MonoController,
} from './mono-controller';

export class ItemManager {

  private controller: MonoController;

  public items: HTMLElement[];

  public activeItem?: HTMLElement;
  public activeItemId?: string;

  public isActive: boolean = false;

  constructor(controller: MonoController) {
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

    if (
      Array.isArray(config.items) === false
      && NodeList.prototype.isPrototypeOf(config.items as NodeListOf<HTMLElement>)
    ) {
      this.items = Array.from(config.items as NodeListOf<HTMLElement>);
      return this;
    }
    
    if (Array.isArray(config.items) === true) {
      this.items = config.items as HTMLElement[];
      return this;
    }

    throw new Error('MonoController: Items not defined.');
  }

  public setItems(items: HTMLElement[] | NodeListOf<HTMLElement> | string): this {
    if (typeof items === 'string') {
      const results = document.querySelectorAll(items);
      if (results !== null) this.items = Array.from(results as NodeListOf<HTMLElement>);
      return this;
    }

    if (NodeList.prototype.isPrototypeOf(items)) {
      this.items = Array.from(items as NodeListOf<HTMLElement>);
      return this;
    }

    if (Array.isArray(items) === true)
      this.items = items as HTMLElement[];
    return this;
  }

  public filterItems(): this {
    this.items = this.items.filter(
      item => this.itemIsValid(item)
    );
    return this;
  }

  public filterActiveItems(): this {
    const { config } = this.controller;

    if (this.items.length > 0) {
      this.items.forEach(item => {
        if (config.itemIsActive(item, this.controller) === true) {
          const id = config.getItemId(item);

          if (this.isActive === true) {
            config.deactivateItem(item, this.controller);
          } else if (id !== false) {
            this.activeItem = item;
            this.activeItemId = id;
            this.isActive = true;
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

    if (config.getItemId(item) === false) valid = false;

    return valid;
  }

  public getItemFromId(id: string): HTMLElement | false {
    const { config } = this.controller;

    const matchedItems: HTMLElement[] = [];

    this.items.forEach(item => {
      if (config.getItemId(item) === id) matchedItems.push(item);
    });

    if (matchedItems.length > 0) return matchedItems[0];

    return false;
  }

  public activate(item: HTMLElement) {
    const { config } = this.controller;

    if (this.itemIsValid(item) === true) {
      config.activateItem(item, this.controller);
      this.activeItem = item;
      this.activeItemId = config.getItemId(item) as string;
      this.isActive = true;
    }
  }

  public deactivate() {
    const { config } = this.controller;

    if (typeof this.activeItem !== 'undefined') {
      config.deactivateItem(this.activeItem, this.controller);
      this.activeItem = undefined;
      this.activeItemId = undefined;
      this.isActive = false;
    }
  }
}