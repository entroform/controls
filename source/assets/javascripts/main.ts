import {
  DuoKnobSlider,
  MonoKnobSlider,
  TextAreaField,
} from '../../../controls/controls';

const textareaElements = document.querySelectorAll('.textareafield');

[...textareaElements].forEach(textareaElement => {
  const textareaField = new TextAreaField({
    element: textareaElement as HTMLTextAreaElement,
  });
  textareaField.initialize();
});

const monoSliderElement = document.querySelector('.monoKnobSlider');
const monoKnobSlider = new MonoKnobSlider({
  trackElement: monoSliderElement.querySelector('.monoKnobSlider__track'),
  knobElement: monoSliderElement.querySelector('.monoKnobSlider__knob'),
  valueElement: monoSliderElement.querySelector('.monoKnobSlider__value'),

  range: [0, 100],

  onInit: slider => {
    slider.value = 50;
  },
});

const duoSliderElement = document.querySelector('.duoKnobSlider');
const duoKnobSlider = new DuoKnobSlider({
  trackElement: duoSliderElement.querySelector('.duoKnobSlider__track'),
  knobOneElement: duoSliderElement.querySelector('.duoKnobSlider__knobOne'),
  knobTwoElement: duoSliderElement.querySelector('.duoKnobSlider__knobTwo'),
  minValueElement: duoSliderElement.querySelector('.duoKnobSlider__valueOne'),
  maxValueElement: duoSliderElement.querySelector('.duoKnobSlider__valueTwo'),

  range: [20, 80],

  onInit: slider => {
    slider.value = [20, 80];
  },

  onUpdate: slider => {
    console.log(slider.value);
  },
});