import { TextAreaField } from '../../../controls/controls';

const textareaElements = document.querySelectorAll('.textareafield');

Array.from(textareaElements).forEach(textareaElement => {
  const textareaField = new TextAreaField({
    element: textareaElement as HTMLTextAreaElement,
  });
  textareaField.initialize();
});

console.log('test');
