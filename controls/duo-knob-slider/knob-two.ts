import {
  DOMUtil,
  DOMTraverse,
  PointerDragEventManager,
} from '@nekobird/rocket';

import {
  DuoKnobSlider,
} from './duo-knob-slider';

export class KnobTwo {

  private duoKnobSlider: DuoKnobSlider;

  public isActive: boolean = false;
  public knobLeftOffset: number;

  public pointerDragEventManager: PointerDragEventManager;

  constructor(duoKnobSlider: DuoKnobSlider) {
    this.duoKnobSlider = duoKnobSlider;
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

      this.knobLeftOffset = position.x - left;

      this.duoKnobSlider.config.onActivate(this.duoKnobSlider);
    }
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
  };

  private eventHandlerEnd = () => {
    if (this.knobOneIsActive === true) {
      this.config.onDeactivate(this);

      this.knobOneIsActive = false;

      this.checkIfActive();
    }
  };

  private checkIfActive() {
    if (
      this.knobOneIsActive === false
      && this.isActive === false
    ) {
      this.isActive = false;
    }
  }

  private onUpdate() {
    let { highlightElement } = this.duoKnobSlider.config;

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
    const { knobTwoElement } = this.duoKnobSlider.config;

    if (DOMUtil.isHTMLElement(knobTwoElement) === true) {
      this.pointerDragEventManager = new PointerDragEventManager({
        target: knobTwoElement,

        keepHistory: false,

        preventDefault: true,

        onStart: this.eventHandlerStart,
        onDrag: this.eventHandlerDrag,
        onEnd: this.eventHandlerEnd,
        onCancel: this.eventHandlerEnd,
      });
    }
  }
}