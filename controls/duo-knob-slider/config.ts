import {
  DuoKnobSlider,
} from './duo-knob-slider';

export interface DuoKnobSliderConfig {
  trackElement?: HTMLElement;

  knobOneElement?: HTMLElement;
  knobTwoElement?: HTMLElement;

  highlightElement?: HTMLElement;

  minValueElement?: HTMLElement;
  maxValueElement?: HTMLElement;

  range: [number, number];
  interval: number;
  useInterval: boolean;

  onInit: (slider: DuoKnobSlider) => void;
  onActivate: (slider: DuoKnobSlider) => void;
  onDeactivate: (slider: DuoKnobSlider) => void;
  onUpdate: (slider: DuoKnobSlider) => void;

  moveKnob: (knob: HTMLElement, left: number) => void;

  updateHighlight: (
    highlight: HTMLElement,
    left: number,
    width: number,
    slider: DuoKnobSlider,
  ) => void;
}

export const DUO_KNOB_SLIDER_DEFAULT_CONFIG: DuoKnobSliderConfig = {
  trackElement: undefined,

  knobOneElement: undefined,
  knobTwoElement: undefined,

  highlightElement: undefined,

  minValueElement: undefined,
  maxValueElement: undefined,

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

  updateHighlight: (highlight, left, width) => {
    highlight.style.transform = `translateX(${left}px)`;
    highlight.style.width = `${width}px`;
  },
};
