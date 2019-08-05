import {
  TextAreaField,
} from '../../../ui-controls/ui-controls';

const textareaElements = document.querySelectorAll('.textareafield');

Array.from(textareaElements).forEach(textareaElement => {
  const textareaField = new TextAreaField(textareaElement as HTMLTextAreaElement);
  textareaField.initialize();
});