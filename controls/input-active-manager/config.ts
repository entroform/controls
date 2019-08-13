import {
  InputActiveManager,
} from './input-active-manager';

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

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