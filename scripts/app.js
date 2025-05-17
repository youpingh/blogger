import { Loader } from './Loader.js';
import { Code } from './Code.js';

/**
 * Sets some globally used event listeners.
 */
window.addEventListener("hashchange", Loader.loadPage);
window.addEventListener("DOMContentLoaded", Loader.loadPage);

// add a hideMenuRows event to the document to hide the category menu when click on anywhere of the page.
let footer = document.getElementById('page-footer');
if (window.self !== window.top) {
    footer.remove();
} else {
    footer.addEventListener("click", () => {
        window.location.hash = '#home/home';
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Optional: adds a smooth scrolling animation
        });
    });
}

// console.log(window.self, window.top);
