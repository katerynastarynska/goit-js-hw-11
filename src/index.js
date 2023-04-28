import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';

const formEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input');
const imageGallery = document.querySelector('.gallery');
// const loadMoreBtn = document.querySelector('.load-more');
const toTopBtn = document.querySelector('.top');

formEl.addEventListener('submit', onSearchBtnHandler);
window.addEventListener('scroll', throttle(handleInfiniteScroll, 500));
// loadMoreBtn.addEventListener('click',  smoothScrollGallery);
toTopBtn.addEventListener('click', onTopBtnScroll);

let imageToFind = '';
let currentPage = 1;
let perPage = 40;

/////
// function fetchImages(e) {
//     e.preventDefault();
//     imageToFind = inputEl.value;

//    const url = `https://pixabay.com/api/?key=35341635-e8056e87c32d0b59c4040edf5&q=${imageToFind}=cat&orientation=horizontal&image_type=photo&safesearch=true&per_page=${perPage}&page=${currentPage}`
//     fetch(url)
//         .then(r => r.json())
//         .then((data) => {
//             if (data.totalHits === 0) {
//                 notificationError();
//                 return;
//             }
//             if (currentPage === 1) {
//                 notificationSuccess(data);
//             }

//             console.log('data', data.totalHits)
// }
//             currentPage += 1;

//             if (currentPage > Math.ceil(data.totalHits / perPage)) {
//                 loadMoreBtn.classList.add('hide');
//                 notificationFaillure();
//             }
//             galleryRenderMarkup(data) 
//         })
//         .catch(err => {
//             console.log(err, "error")
//         })
// }
///////

async function fetchImages() {
    imageToFind = inputEl.value;

    if (imageToFind.length === 0) {
        return;
    }

    const url = `https://pixabay.com/api/?key=35341635-e8056e87c32d0b59c4040edf5&q=${imageToFind}&orientation=horizontal&image_type=photo&safesearch=true&per_page=${perPage}&page=${currentPage}`

    try {
        const response = await axios.get(url);
        if (response?.status !== 200 || !response || !response.status) {
            notificationErrorMessage();
            throw new Error(response.status);
        }
        return response.data;
    } catch (error) {
        notificationErrorMessage();
        throw error;
    }
}

async function onSearchBtnHandler(e) {
    e.preventDefault();
    resetPage();
    try {
        const data = await fetchImages();

        if (data.totalHits === 0) {
            notificationError();
            imageGallery.innerHTML = "";
            // loadMoreBtn.classList.add("hide");
            return;
        }
        // else {
        //     loadMoreBtn.classList.remove("hide");
        // }
        if (currentPage === 1) {
            notificationSuccess(data);
        }
        galleryRenderMarkup(data);

    } catch (error) {
        console.log("unable to get search images", error);
    }
}

// async function onLoadMoreBtnHandler() {
//     currentPage += 1;

//     try {
//         const data = await fetchImages();

//         if (currentPage > Math.ceil(data.totalHits / perPage)) {
//             loadMoreBtn.classList.add('hide');
//             console.log(loadMoreBtn);
//             notificationFaillure();
//         }
//         galleryRenderMarkup(data);

//     } catch (error) {
//         console.log("unable to load more images", error);
//     }
// }

function resetPage() {
    currentPage = 1;
}
function notificationSuccess(data) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}
function notificationFaillure() {
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
}
function notificationError() {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again");
}
function notificationErrorMessage() {
    Notiflix.Notify.failure("Someting went wrong :(");
}

function galleryRenderMarkup(items) {
    console.log('>>>', items);

    const markup = items?.hits?.map((item) => {
        return `<div class="photo-card">
        <a href="${item.largeImageURL}"
          ><img class="photo-card__img" src="${item.webformatURL}" alt="${item.tags}" loading="lazy" width="320"
          height="212"/></a>
        <div class="info-card">
          <p class="info-item"><b>Likes </b>${item.likes}</p>
          <p class="info-item"><b>Views </b>${item.views}</p>
          <p class="info-item"><b>Comments </b>${item.comments}</p>
          <p class="info-item"><b>Downloads </b>${item.downloads}</p>
        </div>
      </div>
      `
    }).join('')

    imageGallery.innerHTML += markup;

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.on('show.simplelightbox');
}

async function onLoadMoreHandler() {

    try {
        const data = await fetchImages();
        console.log('>>>> data ', data.total);

        if (currentPage > Math.ceil(data.totalHits / perPage)) {
            notificationFaillure();
            return;
        }
        galleryRenderMarkup(data);
    } catch (error) {
        console.log("unable to load more images", error);
    }
}

async function handleInfiniteScroll() {
    const scrolled = window.pageYOffset;
    const { height } = imageGallery.firstElementChild.getBoundingClientRect();
    scrolled > height ? toTopBtn.classList.remove('hide') : toTopBtn.classList.add('hide');
  
    const endOfPage = window.innerHeight + scrolled >= document.body.offsetHeight;
    if (endOfPage) {
        await onLoadMoreHandler(currentPage += 1);
    }
};

function onTopBtnScroll() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    })
}