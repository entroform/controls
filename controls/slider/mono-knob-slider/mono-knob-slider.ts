import {
  DOMTraverse,
  DOMUtil,
  MonoDrag,
  Num,
} from '@nekobird/rocket';

import {
  MONO_KNOB_SLIDER_DEFAULT_CONFIG,
  MonoKnobSliderConfig,
} from './config';

export class MonoKnobSlider {
  public config: MonoKnobSliderConfig;

  public isActive: boolean = false;

  public isDisabled: boolean = false;

  private knobOffset: number = 0;

  private currentValue: number = 0;

  private MonoDrag?: MonoDrag;

  constructor(config: Partial<MonoKnobSliderConfig>) {
    this.config = {...MONO_KNOB_SLIDER_DEFAULT_CONFIG};

    this.setConfig(config);

    this.config.onInit(this);

    this.update();

    this.onUpdate();

    this.listen();
  }

  public setConfig(config: Partial<MonoKnobSliderConfig>) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  public get value(): number {
    const { valueRange } = this.config;

    const value = Num.transform(this.currentValue, 1, valueRange, true);

    return this.offsetInterval(value);
  }

  public set value(value: number) {
    const { trackRange, knobElement } = this.getSliderRect();

    const { valueRange } = this.config;

    const computedValue = this.offsetInterval(value);

    const left = Num.transform(computedValue, valueRange, trackRange, true);

    this.currentValue = Num.transform(computedValue, valueRange, 1, true);

    this.config.moveKnob(knobElement, left);

    this.onUpdate();
  }

  public get normalizedValue(): number {
    return this.currentValue;
  }

  private getSliderRect() {
    const trackElement = this.config.trackElement as HTMLElement;
    const knobElement = this.config.knobElement as HTMLElement;

    const trackRect = trackElement.getBoundingClientRect();
    const knobRect = knobElement.getBoundingClientRect();

    return {
      trackRange: [0, trackRect.width - knobRect.width] as [number, number],

      trackElement,
      trackWidth: trackRect.width,
      trackLeft: trackRect.left,

      knobElement,
      knobWidth: knobRect.width,
      knobLeft: knobRect.left,
    };
  }

  public update(): this {
    const { trackRange, knobElement } = this.getSliderRect();

    const { valueRange } = this.config;

    const value = Num.transform(this.currentValue, 1, valueRange, true);

    const computedValue = this.offsetInterval(value);

    this.currentValue = Num.transform(computedValue, valueRange, 1, true);

    const left = Num.transform(computedValue, valueRange, trackRange, true);

    this.config.moveKnob(knobElement, left);

    this.onUpdate();

    return this;
  }

  private onUpdate() {
    if (DOMUtil.isHTMLElement(this.config.highlightElement) === true) {
      const highlightElement = this.config.highlightElement as HTMLElement;

      const { knobLeft, knobWidth, trackLeft } = this.getSliderRect();

      const width = knobLeft - trackLeft + (knobWidth / 2);

      this.config.updateHighlight(highlightElement, width, this);
    }

    this.config.onUpdate(this);
  }

  private offsetInterval(value): number {
    const range = this.config.valueRange[1] - this.config.valueRange[0];

    const remainder = range % this.config.valueInterval;

    if (
      this.config.snapToValueInterval === true
      && typeof this.config.valueInterval === 'number'
      && this.config.valueInterval !== 0
      && this.config.valueInterval < range
      && this.config.valueInterval > 0
      && remainder === 0
    ) {
      const valueRemainder = value % this.config.valueInterval;

      const valueFloor = value - valueRemainder;

      if (valueRemainder < this.config.valueInterval / 2) {
        return valueFloor;
      } else {
        return valueFloor + this.config.valueInterval;
      }
    }

    return value;
  }

  // TODO: Break this into two.
  private eventHandlerStart = pointerEvent => {
    let { trackElement, knobElement, listenToKnobOnly } = this.config;

    if (
      this.isDisabled === false
      && this.isActive === false
      && DOMUtil.isHTMLElement(trackElement, knobElement) === true
    ) {
      knobElement = knobElement as HTMLElement;

      const { trackRange, trackWidth, trackLeft, knobWidth } = this.getSliderRect();

      const { position, target } = pointerEvent;

      if (
        listenToKnobOnly === false
        && target === trackElement
      ) {
        // Check if pointer is at left edge.
        const pointerLeft = position.x - trackLeft;

        const halfKnobWidth = knobWidth / 2;

        if (pointerLeft >= 0 && pointerLeft <= halfKnobWidth) {
          this.currentValue = 0;

          this.config.moveKnob(knobElement, 0);

          this.onUpdate();
          // Check if pointer is at right edge.
        } else if (pointerLeft <= trackWidth && pointerLeft >= trackWidth - halfKnobWidth) {
          this.currentValue = 1;

          this.config.moveKnob(knobElement, trackWidth - knobWidth);

          this.onUpdate();
          // Check if pointer is in between
        } else if (pointerLeft > halfKnobWidth && pointerLeft < trackWidth - halfKnobWidth) {
          let left = pointerLeft - halfKnobWidth;

          const value = Num.transform(left, trackRange, this.config.valueRange, true);

          const computedValue = this.offsetInterval(value);

          left = Num.transform(computedValue, this.config.valueRange, trackRange, true);

          this.currentValue = Num.transform(computedValue, this.config.valueRange, 1, true);

          this.config.moveKnob(knobElement, left);

          this.onUpdate();
        }
      }

      if (
        this.config.listenToKnobOnly === false
        || (
          this.config.listenToKnobOnly === true
          && DOMTraverse.hasAncestor(target, knobElement) !== false
        )
      ) {
        const { knobLeft } = this.getSliderRect();

        this.isActive = true;

        this.knobOffset = position.x - knobLeft;

        this.config.onActivate(this);
      }
    }
  };

  private eventHandlerDrag = pointerEvent => {
    if (this.isActive === true) {
      const { trackRange, trackWidth, trackLeft, knobElement, knobWidth } = this.getSliderRect();

      const { position } = pointerEvent;

      // Get pointer left position relative to track with knob offset.
      let left = position.x - trackLeft - this.knobOffset;

      // Make sure left is within the bound of the track.
      if (left > trackWidth - knobWidth) {
        left = trackWidth - knobWidth;
      } else if (left < 0) {
        left = 0;
      }

      const value = Num.transform(left, trackRange, this.config.valueRange, true);

      const computedValue = this.offsetInterval(value);

      left = Num.transform(computedValue, this.config.valueRange, trackRange, true);

      this.currentValue = Num.transform(left, trackRange, 1, true);

      this.config.moveKnob(knobElement, left);

      this.onUpdate();
    }
  };

  private eventHandlerEnd = () => {
    if (this.isActive === true) {
      this.config.onDeactivate(this);

      this.isActive = false;
    }
  };

  public listen() {
    let { trackElement } = this.config;

    if (DOMUtil.isHTMLElement(trackElement) === true) {
      this.MonoDrag = new MonoDrag({
        preventDefault: true,

        keepHistory: false,

        target: this.config.trackElement,

        onDragStart: this.eventHandlerStart,

        onDrag: this.eventHandlerDrag,

        onDragEnd: this.eventHandlerEnd,

        onDragCancel: this.eventHandlerEnd,
      });
    }
  }
}
