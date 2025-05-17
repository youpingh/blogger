
/**
 * This is a utility to generate all <iframe> tages for other bloggers.
 * This is called at the home.html Code link.
 */
export class Code {

  constructor() { }

  static getInstance() {
    if (!Code._instance) {
      Code._instance = new Code();
    }
    return Code._instance;
  }

  /**
   * Loads a blog according to the value of window.location.hash.
   */
  static async genIframe() {

    const idx = document.getElementsByTagName('a');
    let href, pageName, start, blogTitle;
    let page = document.getElementById('page-content');
    let pageCode = page.innerHTML;
    for (let i = 0; i < idx.length; i++) {
      blogTitle = idx[i].textContent.substring(1);
      href = idx[i].href;
      start = href.indexOf('#') + 1;
      pageName = href.substring(start);
      try {
        await fetch(pageName + '.html')
          .then(response => response.text())
          .then(data => page.innerHTML = data)
          .catch(error => console.error("Error loading page:", error));
      } catch (err) {
        console.error(err);
      }
      Code.getDocHeight(pageName, blogTitle);
      page.innerHTML = pageCode;
    }
  }

  /**
   * Gets the page height and creates an iframe element for other bloggers.
   * @param {*} pageName 
   * @param {*} blogTitle 
   */
  static getDocHeight(pageName, blogTitle) {
    const pageUrl = decodeURI(pageName);
    const body = document.body;
    const html = document.documentElement;

    const height = Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight);

    const iframe = `<iframe src="https://youpingh.github.io/blogger/#${pageUrl}" style='width:600px; height:${height}px;' frameborder="0"></iframe>`;
    console.log(blogTitle, iframe);
    // <iframe src="https://youpingh.github.io/blogger/#afanti2/卸甲归田/退休第一天" style='width:600px; height:480px; '  frameborder="0"'></iframe>
  }
}

window.Code = Code;
