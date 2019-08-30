import {
  DOMUtil,
} from '@nekobird/rocket';

export interface ToggleControlConfig {
  target?: HTMLElement;

  onToggleControl: (
    element: HTMLElement,
    value: boolean,
    control: ToggleControl,
  ) => void;

  transformValue: <V>(
    element: HTMLElement,
    value: boolean,
    control: ToggleControl,
  ) => V;
}

export const TOGGLE_CONTROL_DEFAULT_CONFIG: ToggleControlConfig = {
  onToggleControl: () => {},

  transformValue: <value>(element, value) => value,
};

export class ToggleControl {
  public config: ToggleControlConfig;

  public isOn: boolean = false;

  public isDisabled: boolean = false;

  constructor(config: Partial<ToggleControlConfig>) {
    this.config = {...TOGGLE_CONTROL_DEFAULT_CONFIG};

    this.setConfig(config);
  }

  public setConfig(config: Partial<ToggleControlConfig>) {
    if (typeof config === 'object') {
      Object.assign(this.setConfig, config);
    }
  }

  public get value() {
    let { target } = this.config;

    if (DOMUtil.isHTMLElement(target) === true) {
      target = target as HTMLElement;

      const value = this.config.transformValue(target, this.isOn, this);

      if (
        typeof value === 'undefined'
        || value === null
      ) {
        return this.isOn;
      }

      return value;
    }
  }

  private toggle() {
    this.isOn = !this.isOn;
  }

  private clickHandler = event => {
    if (this.isDisabled === false) {
      let { target } = this.config;

      if (DOMUtil.isHTMLElement(target) === true) {
        target = target as HTMLElement;

        this.toggle();

        this.config.onToggleControl(target, this.isOn, this);
      }
    }
  };

  public listen() {
    let { target } = this.config;

    if (DOMUtil.isHTMLElement(target) === true) {
      target = target as HTMLElement;

      target.addEventListener('click', this.clickHandler);
    }
  }
}
