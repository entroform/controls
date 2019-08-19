import {
  DOMStyle,
  DOMText,
} from '@nekobird/rocket';

export interface TextAreaFieldConfig {
  element?: HTMLTextAreaElement;

  disableLineBreaks: boolean;
  disableTabs: boolean;

  limitNumberOfCharacters: boolean;
  removeLeadingWhitespaces: boolean;
  removeMultipleWhitespaces: boolean;

  onBlur: (textareafield: TextAreaField) => void;
  onFocus: (textareafield: TextAreaField) => void;
  onInput: (textareafield: TextAreaField) => void;
  onPaste: (textareafield: TextAreaField) => void;
  onGrow: (height: number, textareafield: TextAreaField) => void;
}

const TEXTAREAFIELD_DEFAULT_CONFIG: TextAreaFieldConfig = {
  element: undefined,

  disableLineBreaks: false,
  disableTabs: false,
  limitNumberOfCharacters: false,
  removeLeadingWhitespaces: false,
  removeMultipleWhitespaces: false,

  onBlur: () => {},
  onFocus: () => {},
  onInput: () => {},
  onPaste: () => {},
  onGrow: () => {},
};

export class TextAreaField {
  public config: TextAreaFieldConfig;

  public isInFocus: boolean = false;

  public previousKeyCode?: number;

  constructor(config?: Partial<TextAreaFieldConfig>) {
    this.config = {...TEXTAREAFIELD_DEFAULT_CONFIG};
    this.setConfig(config);
  }

  public setConfig(config?: Partial<TextAreaFieldConfig>): this {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }

    if (TextAreaField.isHTMLTextAreaElement(this.config.element) === true) {
      return this;
    } else {
      throw new Error(
        '@nekobird/controls: TextAreaField: Element is undefined or is not a valid HTMLTextAreaElement.',
      );
    }
  }

  public initialize(): this {
    this.filterInput();

    this.grow();

    this.listen();

    return this;
  }

  get selected(): string {
    const element = this.config.element as HTMLTextAreaElement;

    const start = element.selectionStart;
    const end = element.selectionEnd;

    return this.value.substring(start, end);
  }

  public insert(string: string): this {
    const element = this.config.element as HTMLTextAreaElement;

    const start = element.selectionStart;
    const end = element.selectionEnd;

    const text = element.value;

    element.value = text.substring(0, start) + string + text.substring(end);

    element.selectionEnd = start + string.length;

    return this;
  }

  get value(): string {
    const element = this.config.element as HTMLTextAreaElement;

    return element.value;
  }

  set value(value: string) {
    const element = this.config.element as HTMLTextAreaElement;

    element.value = value;

    this.filterAndGrow();
  }

  get isSingleLine(): boolean {
    return this.getHeight('') === this.getHeight();
  }

  get lineCount(): number {
    let { element } = this.config;

    element = element as HTMLTextAreaElement;

    const lineHeight = DOMStyle.getLineHeight(element);

    const offset = this.getHeight('') - lineHeight;

    return (this.getHeight() - offset) / lineHeight;
  }

  public getHeight(text?: string): number {
    let { element } = this.config;

    element = element as HTMLTextAreaElement;

    if (typeof text === 'string') {
      return DOMText.getTextBoxHeightFromElement(element, text);
    }

    return DOMText.getTextBoxHeightFromElement(element);
  }

  // TODO Rename This...
  public filterAndGrow(): this {
    this.filterInput();

    this.grow();

    return this;
  }

  public grow(): this {
    let { element } = this.config;

    element = element as HTMLTextAreaElement;

    const height = DOMText.getTextBoxHeightFromElement(element);
    
    element.style.height = `${height}px`;

    this.config.onGrow(height, this);

    return this;
  }

  public filterInput(): this {
    let { element } = this.config;

    element = element as HTMLTextAreaElement;

    // Remove new lines.
    if (this.config.disableLineBreaks === true) {
      element.value = element.value.replace(/[\r\n]+/g, '');
    }

    // Remove tabs.
    if (this.config.disableTabs === true) {
      element.value = element.value.replace(/[\t]+/g, '');
    }

    // Remove multiple whitespaces to one.
    if (this.config.removeMultipleWhitespaces === true) {
      element.value = element.value.replace(/[\s]+/g, ' ');
    }

    // Remove leading whitespaces.
    if (this.config.removeLeadingWhitespaces === true) {
      element.value = element.value.replace(/^[\s]+/g, '');
    }

    // Trim element value if limit number of characters is a number.
    if (typeof this.config.limitNumberOfCharacters === 'number') {
      element.value = element.value.substring(
        0, this.config.limitNumberOfCharacters
      );
    }

    // Replace tabs with spaces.
    // TODO: Fix this because it's not working as intended.
    // this.config.element.value = this.config.element.value.replace(/[\t]+/g, '    ')
    return this;
  }

  // @event-handlers

  private handleBlur = () => {
    this.isInFocus = false;

    this.config.onBlur(this);
  };

  private handleFocus = () => {
    this.isInFocus = true;

    this.config.onFocus(this);
  };

  private handleInput = event => {
    this.filterAndGrow();

    this.config.onInput(this);
  };

  private handleKeydown = event => {
    const { key } = event;

    if (key === 'Tab') {
      this.insert('\t');

      event.preventDefault();
    }

    if (
      key === 'Enter'
      && this.config.disableLineBreaks === true
    ) {
      event.preventDefault();
    }

    this.previousKeyCode = key;
  }

  private handlePaste = event => {
    this.config.onPaste(this);

    this.filterAndGrow();
  };

  // @listen

  private listen() {
    const element = this.config.element as HTMLTextAreaElement;

    element.addEventListener('blur', this.handleBlur);
    element.addEventListener('focus', this.handleFocus);
    element.addEventListener('input', this.handleInput);
    element.addEventListener('keydown', this.handleKeydown);
    element.addEventListener('paste', this.handlePaste);
    window.addEventListener('resize', this.handleInput);

    return this;
  }

  public stopListen() {
    const element = this.config.element as HTMLTextAreaElement;

    element.removeEventListener('blur', this.handleBlur);
    element.removeEventListener('focus', this.handleFocus);
    element.removeEventListener('input', this.handleInput);
    element.removeEventListener('keydown', this.handleKeydown);
    element.removeEventListener('paste', this.handlePaste);
    window.removeEventListener('resize', this.handleInput);

    return this;
  }

  // @static

  public static isHTMLTextAreaElement(element): boolean {
    return (
      typeof element === 'object'
      && typeof element.nodeType === 'number'
      && element.nodeType === 1
      && typeof element.nodeName === 'string'
      && element.nodeName === 'TEXTAREA'
      && element instanceof HTMLTextAreaElement
    );
  }
}
