import { Loader } from './Loader.js';
import { AppUtils } from './AppUtils.js';
import { Translator } from './Translator.js';

/**
 * Sets some globally used event listeners.
 */
window.addEventListener("hashchange", Loader.loadPage);
window.addEventListener("DOMContentLoaded", Loader.loadPage);
