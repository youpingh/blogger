
// import { AllWords } from './AllWords.js';
// import { CSSManager } from './CSSManager.js';
// import { Home } from '../home/Home.js';
// import { Character } from '../character/Character.js';
// import { Practice } from '../practice/Practice.js';

/**
 * This is loader utility to load a content page based on the value of the window.location.hash.
 */
export class Loader {

  constructor() { }

  static getInstance() {
    if (!Loader._instance) {
      Loader._instance = new Loader();
    }
    return Loader._instance;
  }

  /**
   * Loads a blog according to the value of window.location.hash.
   */
  static async loadPage() {
    // const loader = Loader.getInstance();
    // let pageName = loader.initPageInfo();
    // console.log('page name:', pageName);

    // the full window.location.hash looks like this #blogger/label/title
    let pageName = window.location.hash.replace("#", "") || 'index.html';
    let page = document.getElementById('page-content');

    try {
      await fetch(pageName)
        .then(response => response.text())
        .then(data => page.innerHTML = data)
        .catch(error => console.error("Error loading page:", error));
      console.log(pageName, 'is loaded');
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Initializes the page information
   * @returns page name to be loaded
   */
  // initPageInfo() {
  //   // the full window.location.hash looks like this #label-name/page-title
  //   let hash = window.location.hash.replace("#", "") || 'index.html';
  //   hash = decodeURIComponent(hash);
  //   let names = hash.split('/');
  //   let pageName = names[0];
  //   return pageName;
  // }
}
