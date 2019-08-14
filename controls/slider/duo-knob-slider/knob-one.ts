import {
  DOMUtil,
  DOMTraverse,
  Num,
  PointerDragEventManager,
} from '@nekobird/rocket';

import {
  DuoKnobSlider,
} from './duo-knob-slider';

export class KnobOne {
  private duoKnobSlider: DuoKnobSlider;

  private pointerDragEventManager?: PointerDragEventManager;

  public isActive: boolean = false;

  public offsetLeft: number = 0;

  public value: number = 0;

  constructor(duoKnobSlider: DuoKnobSlider) {
    this.duoKnobSlider = duoKnobSlider;
  }

  public listen() {
    const { knobOneElement } = this.duoKnobSlider.config;

    if (DOMUtil.isHTMLElement(knobOneElement) === true) {
      this.pointerDragEventManager = new PointerDragEventManager({
        target: knobOneElement,

        keepHistory: false,

        preventDefault: true,

        onStart: this.eventHandlerStart,
        onDrag: this.eventHandlerDrag,
        onEnd: this.eventHandlerEnd,
        onCancel: this.eventHandlerEnd,
      });
    }
  }

  private eventHandlerStart = pointerEvent => {
    const { position, target } = pointerEvent;

    let { trackElement, knobTwoElement } = this.duoKnobSlider.config;

    knobTwoElement = knobTwoElement as HTMLElement;

    if (
      this.duoKnobSlider.isDisabled === false
      && this.isActive === false
      && DOMUtil.isHTMLElement(trackElement, knobTwoElement) === true
      && DOMTraverse.hasAncestor(target, knobTwoElement)
    ) {
      this.isActive = true;

      const { left } = knobTwoElement.getBoundingClientRect();

      this.isActive = true;

      this.offsetLeft = position.x - left;

      this.duoKnobSlider.config.onActivate(this.duoKnobSlider);
    }
  };

  private eventHandlerDrag = pointerEvent => {
    if (this.isActive === true) {
      const { trackRect, knobOneTrackRange, knobOneElement, knobOneRect } = this.getSliderRect();

      const { position } = pointerEvent;

      let left = position.x - trackRect.left - this.offsetLeft;

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

  private eventHandlerEnd = () => {
    if (this.isActive === true) {

    }
  };
}