import FetchPictures from './apiService.js';
import cardHBSTamplate from '../card.hbs';
const fetchPictures = new FetchPictures();

import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';

import { notice, info } from '@pnotify/core/';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/Material.css';
const NOTICE_STYLE = 'material';
const NOTICE_DELAY = 2000;
const emptyNoticeOptions = {
  styling: NOTICE_STYLE,
  title: 'Empty query',
  text: 'your query is empty',
  delay: NOTICE_DELAY,
};
const notFoundNoticeOptions = {
  styling: NOTICE_STYLE,
  title: 'No photos found',
  text: 'no results were found for this query.',
  delay: NOTICE_DELAY,
};
const infoOptions = {
  styling: NOTICE_STYLE,
  title: 'Here is the result:',
  delay: NOTICE_DELAY,
};

const bodyRef = document.querySelector('body');
const inputRef = document.querySelector('input');
const galleryRef = document.querySelector('.gallery');
const ballsRef = document.querySelector('.balls');

const debounce = require('lodash.debounce');
const DELAY = 500;
let lightBoxInstance = null;

inputRef.addEventListener('input', debounce(onInputText, DELAY));
galleryRef.addEventListener('click', onImgClick);
window.addEventListener('keydown', onEscapeLightBox);

async function onInputText(e) {
  galleryRef.innerHTML = '';
  if (!e.target.value.trim()) {
    notice(emptyNoticeOptions);
    fetchPictures.clearQuery();
    ballsRef.classList.add('is-hidden');
    return;
  }
  e.preventDefault();
  fetchPictures.incrementPage();
  const resolve = await fetchPictures.goFetch(e.target.value);
  if (!resolve.hits.length) {
    notice(notFoundNoticeOptions);
    return;
  }
  infoOptions.text = `Found ${resolve.total} photos`;
  info(infoOptions);
  renderGallery(resolve.hits);
  ballsRef.classList.remove('is-hidden');
}

let observer = new IntersectionObserver(onEntry, { threshold: 1 });

function onEntry(entries) {
  entries.forEach(onIntersecting);
}

async function onIntersecting(entry) {
  if (entry.isIntersecting) {
    if (fetchPictures.queryIsEmpty()) return;
    fetchPictures.incrementPage();
    const resolve = await fetchPictures.goFetch();
    if (!resolve.hits.length) ballsRef.classList.add('is-hidden');
    renderGallery(resolve.hits);
  }
}
observer.observe(ballsRef);

function onImgClick(e) {
  if (e.target.nodeName === 'IMG') {
    lightBoxInstance = basicLightbox.create(`<img src=${e.target.dataset.src}>`);
    lightBoxInstance.show();
  }
}
function onEscapeLightBox(e) {
  if (e.key === 'Escape' && basicLightbox.visible()) lightBoxInstance.close();
}

function renderGallery(hits) {
  galleryRef.insertAdjacentHTML('beforeend', cardHBSTamplate({ hits }));
}


