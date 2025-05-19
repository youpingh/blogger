
/**
 * This is a utility to generate all <iframe> tages for other bloggers.
 * This is called at the home.html AppUtils link.
 */
export class AppUtils {

  constructor() {
    this.creader = 'https://blog.creaders.net';
    this.blogger = 'https://huyandi.blogspot.com';
    this.creaderIdx = AppUtils.createIndex();
  }

  static getInstance() {
    if (!AppUtils._instance) {
      AppUtils._instance = new AppUtils();
    }
    return AppUtils._instance;
  }

  /**
   * Loads a blog according to the value of window.location.hash.
   */
  static async genIframe() {

    const idx = document.getElementsByTagName('a');
    let attributes = [];
    let href, pageName, start, blogTitle, attr;
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
      attr = AppUtils.genarateAttributes(pageName, blogTitle);
      attributes.push(attr);
      page.innerHTML = pageCode;
    }

    // TODO update the iFrame elements table
    let table = document.getElementById('iframe-elements');
    table.innerHTML = '';
    let tbody = document.createElement('tbody');
    let tr, td;
    for (let i = 0; i < attributes.length; i++) {
      tr = document.createElement('tr');
      td = document.createElement('td');
      td.textContent = attributes[i].title;
      tr.appendChild(td);
      td = document.createElement('td');
      td.textContent = attributes[i].src;
      tr.appendChild(td);
      td = document.createElement('td');
      td.textContent = attributes[i].width;
      tr.appendChild(td);
      td = document.createElement('td');
      td.textContent = attributes[i].height;
      tr.appendChild(td);
      td = document.createElement('td');
      td.textContent = attributes[i].iframe;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    /*
      <table id='iframe-elements' class="no-show">
        <tbody>
          <tr>
            <td>title</td>
            <td>src</td>
            <td>width</td>
            <td>height</td>
            <td>iframe</td>
          </tr>
        </tbody>
      </table>
    */
  }

  /**
   * Gets the page height and creates an iframe element for other bloggers.
   * @param {*} pageName 
   * @param {*} blogTitle 
   */
  static genarateAttributes(pageName, blogTitle) {
    const pageUrl = decodeURI(pageName);
    const body = document.body;
    const html = document.documentElement;

    const height = Math.round((Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight)) * 1.10);
    

    const iframeAttr = {
      title: blogTitle,
      src: `https://youpingh.github.io/#${pageUrl}`,
      width: 600,
      height:height,
      iframe: `<iframe src="https://youpingh.github.io/#${pageUrl}" style='width:600px; height:${height}px;' frameborder="0"></iframe>`
    }
    // console.log(blogTitle, iframeAttr.iframe);
    return iframeAttr;
  }

  /**
   * Shows the generated iFrame elements
   */
  static showIframes() {
    let element = document.getElementById('iframe-elements');
    if (element.style.display == 'block') {
      element.style.display = 'none';
    } else {
      element.style.display = 'block';
    }
  }

  /**
   * Adjusts the footer settings for different bloggers.
   */
  static adjustFooter() {
    const utils = AppUtils.getInstance();
    const origin = window.self.location.ancestorOrigins[0];
    const isCreader = (origin && origin == utils.creader);
    let footer = document.getElementById('page-footer');
    if (window.self !== window.top) {
      footer.remove(); // remove the footer for both remove bloggers (creaders and Blogger)
      if (isCreader) { // add a blog index for creaders
        let blog = document.getElementsByClassName('blog')[0];
        blog.appendChild(utils.creaderIdx);
      }
      // console.log(document.body.innerHTML);
    } else {
      // add a footer event listener for my blog
      footer.addEventListener("click", () => {
        window.location.hash = '#home/home';
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Displays the code generation links.
   */
  static showCodeGenerator() {
    const host = window.location.host;
    let footer = document.getElementById('page-footer');
    let code = document.getElementById('code')
    const showGenerator = (host.startsWith('127.0.0.1') && code != null);
    if (showGenerator) {
      code.style.display = 'block';
      footer.style.display = 'none';
      // console.log(document.body.innerHTML);
    } else {
      if (code) code.style.display = 'none';
      footer.style.display = 'block';
    }
  }

  /**
   * Creates a Creaders blog index as a footer
   * @returns
   */
  static createIndex() {
    let idx = document.createElement('a');
    let img = document.createElement('img');
    img.title = 'My Blog Index';
    img.style.width = '100%';
    img.src = "images/blog/BlogIndex.jpg";

    idx.id = 'blog-index';
    idx.target = '_blank';
    idx.style.textIndent = '0px';
    idx.href = 'https://blog.creaders.net/u/27282/202112/421017.html';

    idx.appendChild(img);
    return idx;
  }
}

window.AppUtils = AppUtils;
