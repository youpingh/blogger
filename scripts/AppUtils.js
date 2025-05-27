
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
   * Adds 'click' event listeners to all the table of content images (home.html).
   */
  static addHomeListeners() {
    const hash = window.location.hash;
    if (hash.length == 0 || hash.includes('home')) {
      let icons = document.getElementsByClassName('category');
      for (let i = 0; i < icons.length; i++) {
        icons[i].title = '展开目录';
        icons[i].addEventListener("click", () => {
          AppUtils.showTOC(icons[i]);
        });
        AppUtils.showTOC(icons[i]);
      }
      let descs = document.getElementsByClassName('category-index');
      for (let i = 0; i < descs.length; i++) {
        descs[i].title = '展开目录';
        descs[i].addEventListener("click", () => {
          AppUtils.showTOC(icons[i]);
        });
      }
    }
  }

  /**
   * Shows/hides a table of contents when it's image is clicked.
   */
  static showTOC(icon) {
    const id = icon.dataset.id;
    let table = document.getElementById(id);
    const display = table.style.display;
    if (!display || display == 'block') {
      table.style.display = 'none';
    } else {
      table.style.display = 'block';
    }
  }

  /**
   * Generates a list of iFrame elements for other blogs to reference this blog.
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

    // update the iFrame elements table
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

    const github = 'https://youpingh.github.io/'
    const iframeAttr = {
      title: blogTitle,
      src: `${github}#${pageUrl}`,
      width: 600,
      height: height,
      iframe: `<iframe src="${github}#${pageUrl}" style='width:600px; height:${height}px;' frameborder="0"></iframe>`
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
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

    let origin = utils.blogger;
    if (!isFirefox) {
      origin = window.location.ancestorOrigins[0]; // TODO Firefox doesn't support this property
    }
    let isCreader = (origin && origin == utils.creader);
    let footer = document.getElementById('page-footer');
    console.log('origin:', origin, 'isCreader:', isCreader);

    if (window.self !== window.top) {
      footer.remove(); // remove the footer for both remove bloggers (creaders and Blogger)
      if (isCreader) { // add a blog index for creaders
        let blog = document.getElementsByClassName('blog')[0];
        blog.appendChild(utils.creaderIdx);
      }
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
      footer.style.display = 'block';
      if (code)
        code.style.display = 'none';
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
