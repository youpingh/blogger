import { Loader } from './Loader.js';
import { AppUtils } from './AppUtils.js';

/**
 * Sets some globally used event listeners.
 */
window.addEventListener("hashchange", Loader.loadPage);
window.addEventListener("DOMContentLoaded", Loader.loadPage);

// When the user scrolls down 20 lines from the top of the document, show the button
window.onscroll = function () { AppUtils.scrollFunction() };
const footer = document.getElementById('topBtn');
footer.addEventListener('click', AppUtils.toTop);

