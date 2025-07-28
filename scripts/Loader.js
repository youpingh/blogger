
import { AppUtils } from './AppUtils.js';
import { Sidebar } from './Sidebar.js';
import { DataStore } from './DataStore.js';

/**
 * This is loader utility to load a content page based on the value of the window.location.hash.
 */
export class Loader {

  constructor() {
    this.loadFooter = true;
  }

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

    const loader = Loader.getInstance();

    // the full window.location.hash looks like this #blogger/label/title
    const pageName = (window.location.hash.replace("#", "") || 'htmls/home') + '.html';
    const elementId = 'page-content';
    // let page = document.getElementById('page-content');
    // let footer = document.getElementById('page-footer');

    await loader.loadHTML(pageName, elementId);
    AppUtils.adjustPage();
    AppUtils.showCodeGenerator();

    const hash = window.location.hash;
    if ((hash.length == 0 || hash.includes('home')) || (window.performance &&
      window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD)) {
      Sidebar.createTOCs(false);
      // Sidebar.printPostTitles();
    }
  }

  async loadHTML(pageName, elementId) {
    let element = document.getElementById(elementId);
    try {
      await fetch(pageName)
        .then(response => response.text())
        .then(data => element.innerHTML = data)
        .catch(error => console.error("Error loading page:", error));
      // console.log(decodeURIComponent(pageName), 'is loaded');
    } catch (err) {
      console.error(err);
    }

    if (this.loadFooter) {
      element = document.getElementById('page-footer');
      try {
        await fetch('htmls/footer.html')
          .then(response => response.text())
          .then(data => element.innerHTML = data)
          .then(() => {
            DataStore.signInSilently();
            this.loadFooter = false;
            console.log('loaded footer');
          })
          .catch(error => console.error("Error loading page:", error));
      } catch (err) {
        console.error(err);
      }
    }
  }
}
