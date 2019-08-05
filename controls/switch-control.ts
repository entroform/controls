import {
  DOMUtil,
} from '@nekobird/rocket';

export interface SwitchControlConfig {
  target: HTMLElement;
  onToggle: (element: HTMLElement, value: boolean, control: SwitchControl) => void;
  transformValue: <V>(element: HTMLElement, value: boolean, control: SwitchControl) => V;
}

export const TOGGLE_CONTROL_DEFAULT_CONFIG = {
  target: undefined,
  onToggle: () => {},
  transformValue: (element, value) => value,
};

export class SwitchControl {
  public config: SwitchControlConfig;
  public isOn: boolean = false;
  public isDisabled: boolean = false;

  constructor(config: Partial<SwitchControlConfig>) {
    this.config = Object.assign({}, TOGGLE_CONTROL_DEFAULT_CONFIG);
    this.setConfig(config);
  }

  public setConfig(config: Partial<SwitchControlConfig>) {
    if (typeof config === 'object') Object.assign(this.setConfig, config);
  }

  public get value() {
    const value = this.config.transformValue(this.config.target, this.isOn, this);
    if (typeof value === 'undefined' || value === null)
      return this.isOn;
    return value;
  }

  private toggle() {
    this.isOn = !this.isOn;
  }

  private clickHandler = event => {
    if (this.isDisabled === false) {
      this.toggle();
      this.config.onToggle(this.config.target, this.isOn, this);
    }
  }

  public listen() {
    if (DOMUtil.isHTMLElement(this.config.target) === true)
      this.config.target.addEventListener('click', this.clickHandler);
  }
}
