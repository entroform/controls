import {
  DOMTraverse,
  DOMUtil,
  Num,
  PointerDragEventManager,
} from '@nekobird/rocket';

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
  updateHighlight: (highlight: HTMLElement, left: number, width: number, slider: DuoKnobSlider) => void;
};

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
  updateHighlight: (highlight, left, width, slider) => {
    highlight.style.transform = `translateX(${left}px)`;
    highlight.style.width = `${width}px`;
  },
};

export class DuoKnobSlider {

  public config: DuoKnobSliderConfig;

  public isActive: boolean = false;
  public knobOneIsActive: boolean = false;
  public knobTwoIsActive: boolean = false;

  private knobOneLeftOffset: number = 0;
  private knobTwoLeftOffset: number = 0;

  private knobOnePointerDragEventManager: PointerDragEventManager;
  private knobTwoPointerDragEventManager: PointerDragEventManager;

  public knobOneValue: number = 0;
  public knobTwoValue: number = 1;
  private currentValues: [number, number];

  public isDisabled: boolean = false;

  constructor(config: Partial<DuoKnobSliderConfig>) {
    this.config = Object.assign({}, DUO_KNOB_SLIDER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.currentValues = [0, 1];

    this.knobOnePointerDragEventManager = new PointerDragEventManager();
    this.knobTwoPointerDragEventManager = new PointerDragEventManager();

    this.config.onInit(this);
    this.onUpdate()
    this.listen();
  }

  public setConfig(config: Partial<DuoKnobSliderConfig>): this {
    if (typeof config === 'object') Object.assign(this.config, config);
    return this;
  }

  public set value(value: [number, number]) {
    const { knobOneTrackRange, knobOneElement, knobTwoTrackRange, knobTwoElement } = this.getSliderRect();

    const computedMinValue = this.offsetInterval(value[0]);
    const computedMaxValue = this.offsetInterval(value[1]);
    const knobOneLeft = Num.modulate(computedMinValue, this.config.range, knobOneTrackRange, true);
    const knobTwoLeft = Num.modulate(computedMaxValue, this.config.range, knobTwoTrackRange, true);

    const min = Num.modulate(computedMinValue, this.config.range, 1, true);
    const max = Num.modulate(computedMaxValue, this.config.range, 1, true);
    this.currentValues = [min, max];

    this.config.moveKnob(knobOneElement, knobOneLeft);
    this.config.moveKnob(knobTwoElement, knobTwoLeft);
    this.onUpdate()
  }

  public get value(): [number, number] {
    let min = Num.modulate(this.currentValues[0], 1, this.config.range, true);
    let max = Num.modulate(this.currentValues[1], 1, this.config.range, true);
    min = this.offsetInterval(min);
    max = this.offsetInterval(max);
    return [min, max];
  }

  public get normalizedValue(): [number, number] {
    return this.currentValues;
  }

  private updateValueFromKnobValues() {
    this.currentValues[0] = Math.min(this.knobOneValue, this.knobTwoValue);
    this.currentValues[1] = Math.max(this.knobOneValue, this.knobTwoValue);
  }

  private getSliderRect() {
    const trackElement = this.config.trackElement as HTMLElement;
    const trackRect = trackElement.getBoundingClientRect();

    const knobOneElement = this.config.knobOneElement as HTMLElement;
    const knobTwoElement = this.config.knobTwoElement as HTMLElement;

    const knobOneRect = knobOneElement.getBoundingClientRect();
    const knobTwoRect = knobTwoElement.getBoundingClientRect();

    return {
      knobOneTrackRange: [0, trackRect.width - knobOneRect.width] as [number, number],
      knobTwoTrackRange: [0, trackRect.width - knobTwoRect.width] as [number, number],
      trackElement,
      trackRect,
      knobOneElement,
      knobOneRect,
      knobTwoElement,
      knobTwoRect,
    };
  }

  private offsetInterval(value): number {
    const range = this.config.range[1] - this.config.range[0];
    const remainder = range % this.config.interval;
    if (
      this.config.useInterval === true
      && typeof this.config.interval === 'number'
      && this.config.interval !== 0
      && this.config.interval < range
      && this.config.interval > 0
      && remainder === 0
    ) {
      const valueRemainder = value % this.config.interval;
      const valueFloor = value - valueRemainder;
      return (valueRemainder < this.config.interval / 2) ? valueFloor : valueFloor + this.config.interval;
    }
    return value;
  }

  private knobOneEventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;
    const knobOneElement = this.config.knobOneElement as HTMLElement;
    if (
      this.isDisabled === false
      && this.knobOneIsActive === false
      && DOMUtil.isHTMLElement(this.config.trackElement) === true
      && DOMUtil.isHTMLElement(this.config.knobOneElement) === true
      && DOMTraverse.hasAncestor(target, knobOneElement)
    ) {
      this.isActive = true;
      const left = knobOneElement.getBoundingClientRect().left;
      this.knobOneIsActive = true;
      this.knobOneLeftOffset = position.x - left;
      this.config.onActivate(this);
    }
  }

  private knobTwoEventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;
    const knobTwoElement = this.config.knobTwoElement as HTMLElement;
    if (
      this.isDisabled === false
      && this.knobTwoIsActive === false
      && DOMUtil.isHTMLElement(this.config.trackElement) === true
      && DOMUtil.isHTMLElement(this.config.knobTwoElement) === true
      && DOMTraverse.hasAncestor(target,knobTwoElement)
    ) {
      this.isActive = true;
      const left = knobTwoElement.getBoundingClientRect().left;
      this.knobTwoIsActive = true;
      this.knobTwoLeftOffset = position.x - left;
      this.config.onActivate(this);
    }
  }

  private knobOneEventHandlerDrag = pointerEvent => {
    if (this.knobOneIsActive === true) {
      const { trackRect, knobOneTrackRange, knobOneElement, knobOneRect } = this.getSliderRect();
      const { position } = pointerEvent;

      let left = position.x - trackRect.left - this.knobOneLeftOffset;

      if (left < 0) left = 0;
      if (left > trackRect.width - knobOneRect.width) left = trackRect.width - knobOneRect.width;

      const value = Num.modulate(left, knobOneTrackRange, this.config.range, true);
      let computedMinValue = this.offsetInterval(value);

      left = Num.modulate(computedMinValue, this.config.range, knobOneTrackRange, true);

      this.knobOneValue = Num.modulate(computedMinValue, this.config.range, 1, true);
      this.updateValueFromKnobValues();
      this.config.moveKnob(knobOneElement, left);
      this.onUpdate()
    }
  }

  private knobTwoEventHandlerDrag = pointerEvent => {
    if (this.knobTwoIsActive === true) {
      const { trackRect, knobTwoTrackRange, knobTwoElement, knobTwoRect } = this.getSliderRect();
      const { position } = pointerEvent;

      let left = position.x - trackRect.left - this.knobTwoLeftOffset;

      if (left < 0) left = 0;
      if (left > trackRect.width - knobTwoRect.width) left = trackRect.width - knobTwoRect.width;

      const value = Num.modulate(left, knobTwoTrackRange, this.config.range, true);
      let computedMaxValue = this.offsetInterval(value);

      left = Num.modulate(computedMaxValue, this.config.range, knobTwoTrackRange, true);

      this.knobTwoValue = Num.modulate(computedMaxValue, this.config.range, 1, true);
      this.updateValueFromKnobValues();
      this.config.moveKnob(knobTwoElement, left);
      this.onUpdate()
    }
  }

  private knobOneEventHandlerEnd = () => {
    if (this.knobOneIsActive === true) {
      this.config.onDeactivate(this);
      this.knobOneIsActive = false;
      this.checkIfActive();
    }
  }

  private knobTwoEventHandlerEnd = () => {
    if (this.knobTwoIsActive === true) {
      this.config.onDeactivate(this);
      this.knobTwoIsActive = false;
      this.checkIfActive();
    }
  }

  private checkIfActive() {
    if (this.knobOneIsActive === false && this.knobTwoIsActive === false)
      this.isActive = false;
  }

  private onUpdate() {
    if (DOMUtil.isHTMLElement(this.config.highlightElement) === true) {
      const slider = this.getSliderRect();
      const knobOneMiddle = slider.knobOneRect.left + slider.knobOneRect.width / 2;
      const knobTwoMiddle = slider.knobTwoRect.left + slider.knobTwoRect.width / 2;
      const left = Math.min(knobOneMiddle, knobTwoMiddle) - slider.trackRect.left;
      const width = Num.getEuclideanDistance(knobOneMiddle, knobTwoMiddle);
      this.config.updateHighlight(this.config.highlightElement as HTMLElement, left, width, this);
      this.config.onUpdate(this)
    }
  }

  public listen() {
    const { knobOneElement, knobTwoElement } = this.config;
    if (
      DOMUtil.isHTMLElement(knobOneElement) === true
      && DOMUtil.isHTMLElement(knobTwoElement) === true
    ) {
      this.knobOnePointerDragEventManager = new PointerDragEventManager({
        keepHistory: false,
        target: knobOneElement,
        preventDefault: true,
        onStart: this.knobOneEventHandlerStart,
        onDrag: this.knobOneEventHandlerDrag,
        onEnd: this.knobOneEventHandlerEnd,
        onCancel: this.knobOneEventHandlerEnd,
      });
      this.knobTwoPointerDragEventManager = new PointerDragEventManager({
        keepHistory: false,
        target: knobTwoElement,
        preventDefault: true,
        onStart: this.knobTwoEventHandlerStart,
        onDrag: this.knobTwoEventHandlerDrag,
        onEnd: this.knobTwoEventHandlerEnd,
        onCancel: this.knobTwoEventHandlerEnd,
      });
    }
  }
}
