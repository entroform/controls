import {
  DOMTraverse,
  DOMUtil,
  Num,
  PointerDragEventManager,
} from '@nekobird/rocket';

import {
  DuoKnobSliderConfig,
  DUO_KNOB_SLIDER_DEFAULT_CONFIG,
} from './config';

import {
  KnobOne,
} from './knob-one';

import {
  KnobTwo,
} from './knob-two';

type DuoKnobSliderModes = 'free' | 'normal' | 'strict';

export class DuoKnobSlider {
  public config: DuoKnobSliderConfig;

  public isActive: boolean = false;
  public isDisabled: boolean = false;

  public knobOne: KnobOne;
  public knobTwo: KnobTwo;

  private currentValue: [number, number];

  constructor(config: Partial<DuoKnobSliderConfig>) {
    this.config = Object.assign({}, DUO_KNOB_SLIDER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.knobOne = new KnobOne(this);
    this.knobTwo = new KnobTwo(this);

    this.currentValue = [0, 1];

    this.config.onInit(this);

    this.onUpdate()

    this.listen();
  }

  public setConfig(config: Partial<DuoKnobSliderConfig>): this {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }

    return this;
  }

  public set value(value: [number, number]) {
    const {
      knobOneTrackRange,
      knobOneElement,
      knobTwoTrackRange,
      knobTwoElement,
    } = this.getSliderRect();

    const computedMinValue = this.offsetInterval(value[0]);
    const computedMaxValue = this.offsetInterval(value[1]);

    const knobOneLeft = Num.modulate(computedMinValue, this.config.range, knobOneTrackRange, true);
    const knobTwoLeft = Num.modulate(computedMaxValue, this.config.range, knobTwoTrackRange, true);

    const min = Num.modulate(computedMinValue, this.config.range, 1, true);
    const max = Num.modulate(computedMaxValue, this.config.range, 1, true);

    this.currentValue = [min, max];

    this.config.moveKnob(knobOneElement, knobOneLeft);
    this.config.moveKnob(knobTwoElement, knobTwoLeft);

    this.onUpdate()
  }

  public get value(): [number, number] {
    let min = Num.modulate(this.currentValue[0], 1, this.config.range, true);
    let max = Num.modulate(this.currentValue[1], 1, this.config.range, true);

    min = this.offsetInterval(min);
    max = this.offsetInterval(max);

    return [min, max];
  }

  public get normalizedValue(): [number, number] {
    return this.currentValue;
  }

  private updateValueFromKnobValues() {
    this.currentValue[0] = Math.min(this.knobOneValue, this.knobTwoValue);
    this.currentValue[1] = Math.max(this.knobOneValue, this.knobTwoValue);
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
    const { range, interval, useInterval } = this.config;

    const rangeDifference = range[1] - range[0];

    const remainder = rangeDifference % interval;

    if (
      useInterval === true
      && typeof interval === 'number'
      && interval !== 0
      && interval < rangeDifference
      && interval > 0
      && remainder === 0
    ) {
      const valueRemainder = value % interval;

      const valueFloor = value - valueRemainder;

      if (valueRemainder < interval / 2) {
        return valueFloor;
      } else {
        return valueFloor + interval;
      }
    }

    return value;
  }

  private knobOneEventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;

    let { knobOneElement, trackElement } = this.config;

    knobOneElement = knobOneElement as HTMLElement;

    if (
      this.isDisabled === false
      && this.knobOneIsActive === false
      && DOMUtil.isHTMLElement(trackElement, knobOneElement) === true
      && DOMTraverse.hasAncestor(target, knobOneElement)
    ) {
      this.isActive = true;

      const { left } = knobOneElement.getBoundingClientRect();

      this.knobOneIsActive = true;

      this.knobOneLeftOffset = position.x - left;

      this.config.onActivate(this);
    }
  };

  private knobTwoEventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;

    let { trackElement, knobTwoElement } = this.config;

    knobTwoElement = knobTwoElement as HTMLElement;

    if (
      this.isDisabled === false
      && this.knobTwoIsActive === false
      && DOMUtil.isHTMLElement(trackElement, knobTwoElement) === true
      && DOMTraverse.hasAncestor(target, knobTwoElement)
    ) {
      this.isActive = true;

      const { left } = knobTwoElement.getBoundingClientRect();

      this.knobTwoIsActive = true;

      this.knobTwoLeftOffset = position.x - left;

      this.config.onActivate(this);
    }
  };

  private knobOneEventHandlerDrag = pointerEvent => {
    if (this.knobOneIsActive === true) {
      const { trackRect, knobOneTrackRange, knobOneElement, knobOneRect } = this.getSliderRect();

      const { position } = pointerEvent;

      let left = position.x - trackRect.left - this.knobOneLeftOffset;

      if (left < 0) {
        left = 0;
      } else if (left > trackRect.width - knobOneRect.width) {
        left = trackRect.width - knobOneRect.width;
      }

      const value = Num.modulate(left, knobOneTrackRange, this.config.range, true);

      let computedMinValue = this.offsetInterval(value);

      left = Num.modulate(computedMinValue, this.config.range, knobOneTrackRange, true);

      this.knobOneValue = Num.modulate(computedMinValue, this.config.range, 1, true);

      this.updateValueFromKnobValues();

      this.config.moveKnob(knobOneElement, left);

      this.onUpdate()
    }
  };

  private knobTwoEventHandlerDrag = pointerEvent => {
    if (this.knobTwoIsActive === true) {
      const { trackRect, knobTwoTrackRange, knobTwoElement, knobTwoRect } = this.getSliderRect();

      const { position } = pointerEvent;

      let left = position.x - trackRect.left - this.knobTwoLeftOffset;

      if (left < 0) {
        left = 0;
      } else if (left > trackRect.width - knobTwoRect.width) {
        left = trackRect.width - knobTwoRect.width;
      }

      const value = Num.modulate(left, knobTwoTrackRange, this.config.range, true);

      let computedMaxValue = this.offsetInterval(value);

      left = Num.modulate(computedMaxValue, this.config.range, knobTwoTrackRange, true);

      this.knobTwoValue = Num.modulate(computedMaxValue, this.config.range, 1, true);

      this.updateValueFromKnobValues();

      this.config.moveKnob(knobTwoElement, left);

      this.onUpdate()
    }
  };

  private knobOneEventHandlerEnd = () => {
    if (this.knobOneIsActive === true) {
      this.config.onDeactivate(this);

      this.knobOneIsActive = false;

      this.checkIfActive();
    }
  };

  private knobTwoEventHandlerEnd = () => {
    if (this.knobTwoIsActive === true) {
      this.config.onDeactivate(this);

      this.knobTwoIsActive = false;

      this.checkIfActive();
    }
  };

  private checkIfActive() {
    if (
      this.knobOneIsActive === false
      && this.knobTwoIsActive === false
    ) {
      this.isActive = false;
    }
  }

  private onUpdate() {
    let { highlightElement } = this.config;

    if (DOMUtil.isHTMLElement(highlightElement) === true) {
      highlightElement = highlightElement as HTMLElement;

      const slider = this.getSliderRect();

      const knobOneMiddle = slider.knobOneRect.left + slider.knobOneRect.width / 2;
      const knobTwoMiddle = slider.knobTwoRect.left + slider.knobTwoRect.width / 2;

      const left = Math.min(knobOneMiddle, knobTwoMiddle) - slider.trackRect.left;

      const width = Num.getEuclideanDistance(knobOneMiddle, knobTwoMiddle);

      this.config.updateHighlight(highlightElement, left, width, this);
    }

    this.config.onUpdate(this)
  }

  public listen() {
    const { knobOneElement, knobTwoElement } = this.config;

    if (DOMUtil.isHTMLElement(knobOneElement, knobTwoElement) === true) {
      this.knobOnePointerDragEventManager = new PointerDragEventManager({
        target: knobOneElement,

        keepHistory: false,

        preventDefault: true,

        onStart: this.knobOneEventHandlerStart,
        onDrag: this.knobOneEventHandlerDrag,
        onEnd: this.knobOneEventHandlerEnd,
        onCancel: this.knobOneEventHandlerEnd,
      });

      this.knobTwoPointerDragEventManager = new PointerDragEventManager({
        target: knobTwoElement,

        keepHistory: false,

        preventDefault: true,

        onStart: this.knobTwoEventHandlerStart,
        onDrag: this.knobTwoEventHandlerDrag,
        onEnd: this.knobTwoEventHandlerEnd,
        onCancel: this.knobTwoEventHandlerEnd,
      });
    }
  }
}
