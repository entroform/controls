import {
  MonoKnobSlider,
} from './mono-knob-slider';

export interface MonoKnobSliderConfig {
  trackElement?: HTMLElement;
  knobElement?: HTMLElement;
  highlightElement?: HTMLElement;
  valueElement?: HTMLElement;

  listenToKnobOnly: boolean;

  range: [number, number];
  interval: number;
  useInterval: boolean;

  onInit: (slider: MonoKnobSlider) => void;
  onActivate: (slider: MonoKnobSlider) => void;
  onDeactivate: (slider: MonoKnobSlider) => void;
  onUpdate: (slider: MonoKnobSlider) => void;
  moveKnob: (knob: HTMLElement, left: number) => void;
  updateHighlight: (highlight: HTMLElement, width: number, slider: MonoKnobSlider) => void;
}

export const MONO_KNOB_SLIDER_DEFAULT_CONFIG: MonoKnobSliderConfig = {
  trackElement: undefined,
  knobElement: undefined,
  highlightElement: undefined,
  valueElement: undefined,

  listenToKnobOnly: false,

  range: [0, 1],
  interval: 0.1,
  useInterval: false,

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