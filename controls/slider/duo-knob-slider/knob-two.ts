import {
  DOMTraverse,
  DOMUtil,
  Num,
  MonoDrag,
} from '@nekobird/rocket';

import {
  DuoKnobSlider,
} from './duo-knob-slider';

export class KnobTwo {
  private duoKnobSlider: DuoKnobSlider;

  public monoDrag?: MonoDrag;

  public isActive: boolean = false;
  public isReady: boolean = false;

  public offsetLeft: number = 0;

  public value: number = 0;
 
  constructor(duoKnobSlider: DuoKnobSlider) {
    this.duoKnobSlider = duoKnobSlider;
  }

  public listen() {
    const { knobTwoElement } = this.duoKnobSlider.config;

    if (DOMUtil.isHTMLElement(knobTwoElement) === true) {
      this.monoDrag = new MonoDrag({
        target: knobTwoElement,

        keepHistory: false,

        preventDefault: true,

        onDragStart: this.eventHandlerStart,
        onDrag: this.eventHandlerDrag,
        onDragEnd: this.eventHandlerEnd,
        onDragCancel: this.eventHandlerEnd,
      });

      this.isReady = true;
    }
  }

  private eventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;

    let { config, isDisabled } = this.duoKnobSlider;

    let { trackElement, knobTwoElement } = config;

    knobTwoElement = knobTwoElement as HTMLElement;

    if (
      isDisabled === false
      && this.isActive === false
      && DOMUtil.isHTMLElement(trackElement, knobTwoElement) === true
      && DOMTraverse.hasAncestor(target, knobTwoElement)
    ) {
      this.isActive = true


      config.onActivate(this.duoKnobSlider);
      const { left: knobTwoElementLeft } = knobTwoElement.getBoundingClientRect();

      this.isActive = true;

      this.offsetLeft = position.x - knobTwoElementLeft;

       
  };

  private eventHandlerDrag = pointerEvent => {
    if (this.isActive === true) {
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
  }

  private eventHandlerEnd = () => {
    if (this.isActive === true) {
      // Do something.
    }
  }
}