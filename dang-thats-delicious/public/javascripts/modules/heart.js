import axios from 'axios';
import { $, $$ } from './bling';

$$('form.heart .heart__button').on('animationend', event => event.target.classList.remove('heart__button--float'));

function ajaxHeart(event) {
  event.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
      } else {
        this.heart.classList.remove('heart__button--float');
      }
    })
    .catch(error => console.error(error));
}

export default ajaxHeart;
