
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
   * Generates a list of iFrame code, save it to a JSON file, 
   * and modify the Blogger's backup xml file with the generated code.
   */
  static async genIframeCode(event) {
    const file = event.files[0];
    if (!file) {
      output.textContent = 'No file selected.';
    } else {
      AppUtils.iFrameCode(file.name);
    }
  }

  /**
   * Generates a list of iFrame code, save it to a JSON file, 
   * and modify the Blogger's backup xml file with the generated code.
   */
  static async iFrameCode(file) {

    let output = document.getElementById('output');
    let attributes = [];

    try {
      // get attributes for a iFrame code (title, url, width, height);
      const idx = document.getElementsByTagName('a');
      let href, pageName, start, blogTitle, attr;
      let page = document.getElementById('page-content');
      let pageCode = page.innerHTML;
      for (let i = 0; i < idx.length; i++) {
        blogTitle = idx[i].textContent.substring(1).replace(/\s+/g, "").trim();
        href = idx[i].href;
        start = href.indexOf('#') + 1;
        pageName = href.substring(start);
        console.log("loading", decodeURI(pageName));
        try {
          await fetch(pageName + '.html')
            .then(response => response.text())
            .then(data => page.innerHTML = data)
            .catch(error => console.error("Error loading page:", error));
        } catch (err) {
          console.error("loading", decodeURI(pageName), 'failed', err);
        }
        attr = AppUtils.genarateAttributes(pageName, blogTitle);
        attributes.push(attr);
        page.innerHTML = pageCode;
      }
      output.textContent = 'iFrame code is generated.';
      console.log('iFrame code is generated.');

      // save this to a JSON file for Creaders as it doesn't support batch update.
      // create a download link to save the generated code to a JSON file.
      let iFrameCode = 'export class AllFrames {\n	static ALL_FRAMES = Object.freeze(\n' +
        JSON.stringify(attributes, null, 2) + ');}';

      const blob = new Blob([iFrameCode], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'modified-blog.js';
      downloadLink.textContent = 'Download Modified JSON';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      output.textContent = 'iFrame code JSON file is saved.';
      console.log('iFrame code JSON file is saved..');
    } catch (error) {
      console.error(error);
    }

    // update the Blooger's backup xml file with the generated iFrame code.
    let xmlDoc = null
    let xmlString = null;
    try {
      // Read the XML file
      file = '../google/' + file;
      await fetch(file)
        .then(response => response.text())
        .then(data => xmlString = data)
        .catch(error => console.error("Error loading XML:", error));
      console.log('Loaded the Blogger backup XML file.');
    } catch (error) {
      output.textContent = `Error reading XML: ${error.message}`;
    }

    try {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Check for parsing errors
      if (xmlDoc.documentElement.nodeName === 'parsererror') {
        throw new Error('Invalid XML file.');
      }

      output.textContent = 'XML file parsed.';
      console.log('Parsed the Blogger backup XML file.');
    } catch (error) {
      output.textContent = `Error parsing XML: ${error.message}`;
    }

    try {
      // Get all <entry> elements
      const entries = xmlDoc.getElementsByTagName('entry');
      let postCount = 0;

      for (let entry of entries) {
        // Check if entry is a post
        const categories = entry.getElementsByTagName('category');
        let isPost = false;
        for (let category of categories) {
          const term = category.getAttribute('term');
          if (term.includes('kind#post')) {
            isPost = true;
            break;
          }
        }

        // Modify post content
        const title = entry.getElementsByTagName('title')[0]?.textContent || '(No title)';
        if (isPost) {
          let contentElement = entry.getElementsByTagName('content')[0];
          let content = '';
          if (contentElement) {
            // Get existing content and append the generated code
            content = attributes.find(item => item.title == title);
            if (content) {
              contentElement.textContent = content.iframe;
              postCount++;
            } else {
              console.log('Not in the list:', title);
            }
          }
        } else {
          console.log('Not a post:', title);
        }
      }
      console.log('Updated the Blogger backup XML file:', postCount, 'posts.');
    } catch (error) {
      output.textContent = `Error parsing XML: ${error.message}`;
    }

    try {
      // Serialize updated XML
      const serializer = new XMLSerializer();
      const updatedXmlString = serializer.serializeToString(xmlDoc);

      // Create downloadable file
      const blob = new Blob([updatedXmlString], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'modified-blog.xml';
      downloadLink.textContent = 'Download Modified XML';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      output.textContent = `Modified ${postCount} posts. Download the updated XML file.`;
      console.log(`Modified ${postCount} posts. Download the updated XML file.`);
    } catch (error) {
      output.textContent = `Error download XML: ${error.message}`;
    }
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

    const github = 'https://youpingh.github.io/blogger/'
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
