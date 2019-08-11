import {
  DOMTraverse,
} from '@nekobird/rocket';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

export interface InputActiveManagerConfig {
  getInputElement: () => HTMLElement | null;

  activateOnFocus: boolean;

  beforeActivate: (input: InputElement) => Promise<void>;
  afterActivate: (input: InputElement) => void;

  conditionActivate: (input: InputElement) => boolean;

  beforeDeactivate: (input: InputElement) => Promise<void>;
  afterDeactivate: (input: InputElement) => void;

  activate: (input: InputElement) => Promise<void>;
  deactivate: (input: InputElement) => Promise<void>;

  onFocus: (input: InputElement, context: InputActiveManager) => void;
  onBlur: (input: InputElement, context: InputActiveManager) => void;
  onInput: (input: InputElement, context: InputActiveManager) => void;
}

export const INPUT_FOCUS_MANAGER_CONFIG: InputActiveManagerConfig = {
  getInputElement: () => null,

  activateOnFocus: true,

  conditionActivate: input => input.value !== '',

  beforeActivate: input => Promise.resolve(),
  afterActivate: input => Promise.resolve(),

  beforeDeactivate: input => Promise.resolve(),
  afterDeactivate: input => Promise.resolve(),

  activate: input => Promise.resolve(),
  deactivate: input => Promise.resolve(),

  onFocus: () => {},
  onBlur: () => {},
  onInput: () => {},
};

export class InputActiveManager {

  public config: InputActiveManagerConfig;

  public element?: InputElement;

  public isActive: boolean = false;
  public isReady: boolean = false;

  constructor(config?: Partial<InputActiveManagerConfig>) {
    this.config = Object.assign({}, INPUT_FOCUS_MANAGER_CONFIG);
    this.setConfig(config);

    this.updateElement();

    this.listen();

    this.initialize();
  }

  private setConfig(config?: Partial<InputActiveManagerConfig>) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  private updateElement() {
    const element = this.config.getInputElement();

    if (
      element !== null
      && (
        element.nodeName === 'INPUT'
        || element.nodeName === 'TEXTAREA'
      )
    ) {
      this.element = element as InputElement;

      this.isReady = false;
    } else {
      throw new Error('@nekobird/controls: InputActiveManager: Fail to get elements.');
    }
  }

  public initialize() {
    if (this.isReady === true) {
      let element = this.element as InputElement;

      if (this.config.conditionActivate(element) === true) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
  }

  private async activate(): Promise<void> {
    if (
      this.isReady === true
      && this.isActive === false
    ) {
      let element = this.element as InputElement;

      await this.config.beforeActivate(element);

      await this.config.activate(element);
      this.isActive = true;

      return this.config.afterActivate(element);
    }

    return Promise.reject();
  }

  private async deactivate(): Promise<void> {
    if (
      this.isReady === true
      && this.isActive === true
    ) {
      let element = this.element as InputElement;

      await this.config.beforeDeactivate(element);

      await this.config.deactivate(element);
      this.isActive = false;

      return this.config.afterDeactivate(element);
    }

    return Promise.reject();
  }

  private eventHandlerFocus = event => {
    let element = this.element as InputElement;

    this.config.onFocus(element, this);

    if (this.config.activateOnFocus === true) {
      this.activate(); 
    }
  };

  private eventHandlerBlur = event => {
    if (this.isReady === true) {
      let element = this.element as InputElement;

      this.config.onBlur(element, this);

      if (
        this.config.activateOnFocus === true
        && this.config.conditionActivate(element) === false
      ) {
        this.deactivate();
      }
    }
  };

  private eventHandlerInput = event => {
    if (this.isReady === true) {

      let element = this.element as InputElement;

      this.config.onInput(element, this);

      if (this.config.activateOnFocus === false) {
        if (this.config.conditionActivate(element) === true) {
          this.activate();
        } else {
          this.deactivate();
        }
      }
    }
  };

  public listen() {
    if (this.isReady === true) {

      let element = this.element as InputElement;

      element.addEventListener('focus', this.eventHandlerFocus);
      element.addEventListener('blur', this.eventHandlerBlur);
      element.addEventListener('input', this.eventHandlerInput);
    }
  }

  public stop() {
    if (this.isReady === true) {

      let element = this.element as InputElement;

      element.removeEventListener('focus', this.eventHandlerFocus);
      element.removeEventListener('blur', this.eventHandlerBlur);
      element.removeEventListener('input', this.eventHandlerInput);
    }
  }
}
