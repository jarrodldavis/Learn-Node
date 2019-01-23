import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store =>
    `<a href="/store/${store.slug}" class="search__result">
      <strong>${store.name}</strong>
    </a>`).join('');
}

function updateActive(resultsElement, direction) {
  const activeClass = 'search__result--active';

  if (resultsElement.childElementCount === 0) {
    return;
  }

  let currentActive = resultsElement.querySelector(`.${activeClass}`);

  let newActive;

  if (currentActive) {
    newActive = direction === 'up'
      ? currentActive.previousElementSibling
      : currentActive.nextElementSibling;
  }

  if (!newActive) {
    newActive = direction === 'up'
      ? resultsElement.lastElementChild
      : resultsElement.firstElementChild;
  }

  if (currentActive) {
    currentActive.classList.remove(activeClass);
  }
  newActive.classList.add(activeClass);
}

function navigateToActive(resultsElement) {
  let currentActive = resultsElement.querySelector('.search__result--active');

  if (!currentActive) {
    return;
  }

  currentActive.click();
}

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    axios.get(`/api/search?q=${this.value}`)
         .then(res => {
           if (res.data.length) {
             searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
           } else {
             searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found</div>`);
           }
         })
         .catch(error => console.error(error));
  });

  searchInput.on('keyup', event => {
    switch (event.keyCode) {
      case 40:
        updateActive(searchResults, 'down');
        break;
      case 38:
        updateActive(searchResults, 'up');
        break;
      case 13:
        navigateToActive(searchResults);
        break;
    }
  })
}

export default typeAhead;
