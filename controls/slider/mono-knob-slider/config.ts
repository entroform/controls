import {
  MonoKnobSlider,
} from './mono-knob-slider';

// Assumes the following:
// left to right
// top to bottom

export interface MonoKnobSliderConfig {
  trackElement?: HTMLElement;

  knobElement?: HTMLElement;

  highlightElement?: HTMLElement;

  valueElement?: HTMLElement;

  listenToKnobOnly: boolean;

  axis: 'horizontal' | 'vertical';

  reverse: boolean;

  valueRange: [number, number];

  valueInterval: number;

  snapToValueInterval: boolean;

  onInit: (slider: MonoKnobSlider) => void;

  onActivate: (slider: MonoKnobSlider) => void;

  onDeactivate: (slider: MonoKnobSlider) => void;

  onUpdate: (slider: MonoKnobSlider) => void;

  moveKnob: (knob: HTMLElement, left: number) => void;

  updateHighlight: (
    highlight: HTMLElement,
    width: number,
    slider: MonoKnobSlider
  ) => void;
}

export const MONO_KNOB_SLIDER_DEFAULT_CONFIG: MonoKnobSliderConfig = {
  trackElement: undefined,

  knobElement: undefined,

  highlightElement: undefined,

  valueElement: undefined,

  listenToKnobOnly: false,

  axis: 'horizontal',

  reverse: false,

  valueRange: [0, 1],

  valueInterval: 0.1,

  snapToValueInterval: false,

  onInit: () => {},

  onActivate: () => {},

  onDeactivate: () => {},

  onUpdate: () => {},

  moveKnob: (knob, left) => {
    knob.style.transform = `translateX(${left}px)`;
  },

  updateHighlight: (highlight, width) => {
    highlight.style.width = `${width}px`;
  },
};