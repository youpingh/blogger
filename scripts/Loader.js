
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

    // the full window.location.hash looks like this #blogger/label/title
    const pageName = (window.location.hash.replace("#", "") || 'home/home') + '.html';
    let page = document.getElementById('page-content');

    try {
      await fetch(pageName)
        .then(response => response.text())
        .then(data => page.innerHTML = data)
        .catch(error => console.error("Error loading page:", error));
      // console.log(pageName, 'is loaded');
    } catch (err) {
      console.error(err);
    }
    let idx = document.getElementById('blog-index');
    if (idx) idx.style.display = 'none';
  }
}
