import {
  DOMTraverse,
  DOMUtil,
  Num,
  PointerDragEventManager,
} from '@nekobird/rocket';

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
};

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

export class MonoKnobSlider {

  public config: MonoKnobSliderConfig;

  public isActive: boolean = false;
  public isDisabled: boolean = false;

  private knobLeftOffset: number = 0;

  private currentValue: number = 0;

  private pointerDragEventManager: PointerDragEventManager;

  constructor(config: Partial<MonoKnobSliderConfig>) {
    this.config = Object.assign({}, MONO_KNOB_SLIDER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.pointerDragEventManager = new PointerDragEventManager();

    this.config.onInit(this);
    this.update();
    this.onUpdate();
    this.listen();
  }

  public setConfig(config: Partial<MonoKnobSliderConfig>) {
    if (typeof config === 'object') Object.assign(this.config, config);
  }

  public set value(value: number) {
    const { trackRange, knobElement } = this.getSliderRect();

    const computedValue = this.offsetInterval(value);
    const left = Num.modulate(computedValue, this.config.range, trackRange, true);
    this.currentValue = Num.modulate(computedValue, this.config.range, 1, true);

    this.config.moveKnob(knobElement, left);
    this.onUpdate();
  }

  public get value(): number {
    const value = Num.modulate(this.currentValue, 1, this.config.range, true);
    return this.offsetInterval(value);
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

    const value = Num.modulate(this.currentValue, 1, this.config.range, true);
    const computedValue = this.offsetInterval(value);
    const left = Num.modulate(computedValue, this.config.range, trackRange, true);
    this.currentValue = Num.modulate(computedValue, this.config.range, 1, true);

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

  // TODO: Break this into two.
  private eventHandlerStart = (pointerEvent) => {
    if (
      this.isDisabled === false
      && this.isActive === false
      && DOMUtil.isHTMLElement(this.config.knobElement) === true
      && DOMUtil.isHTMLElement(this.config.trackElement) === true
    ) {

      const { trackRange, trackWidth, trackLeft, knobElement, knobWidth } = this.getSliderRect();
      const { position, target } = pointerEvent;

      if (
        this.config.listenToKnobOnly === false
        && pointerEvent.target === this.config.trackElement
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

          const value = Num.modulate(left, trackRange, this.config.range, true);
          const computedValue = this.offsetInterval(value);
          left = Num.modulate(computedValue, this.config.range, trackRange, true);
          this.currentValue = Num.modulate(computedValue, this.config.range, 1, true);

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
        this.knobLeftOffset = position.x - knobLeft;
        this.config.onActivate(this);
      }
    }
  }

  private eventHandlerDrag = pointerEvent => {
    if (this.isActive === true) {
      const { trackRange, trackWidth, trackLeft, knobElement, knobWidth } = this.getSliderRect();
      const { position } = pointerEvent;

      // Get pointer left position relative to track with knob offset.
      let left = position.x - trackLeft - this.knobLeftOffset;

      // Make sure left is within the bound of the track.
      if (left > trackWidth - knobWidth) left = trackWidth - knobWidth;
      if (left < 0) left = 0;

      const value = Num.modulate(left, trackRange, this.config.range, true);
      const computedValue = this.offsetInterval(value);
      left = Num.modulate(computedValue, this.config.range, trackRange, true);
      this.currentValue = Num.modulate(left, trackRange, 1, true);
      this.config.moveKnob(knobElement, left);
      this.onUpdate();
    }
  }

  private eventHandlerEnd = () => {
    if (this.isActive === true) {
      this.config.onDeactivate(this);
      this.isActive = false;
    }
  }

  public listen() {
    if (DOMUtil.isHTMLElement(this.config.trackElement) === true) {
      this.pointerDragEventManager = new PointerDragEventManager({
        onEvent: event => event.preventDefault(),
        keepHistory: false,
        target: this.config.trackElement,
        onStart: this.eventHandlerStart,
        onDrag: this.eventHandlerDrag,
        onEnd: this.eventHandlerEnd,
        onCancel: this.eventHandlerEnd,
      });
    }
  }
}
