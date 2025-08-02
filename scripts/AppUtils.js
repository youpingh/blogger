import { Sidebar } from './Sidebar.js';
import { BlogReader } from './BlogReader.js';
import { DataStore } from './DataStore.js';

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
   * Goes to the bookmark by id. 
   * Cannot use #id as the window.location.hash is used by Single Page App approach.
   * @param {*} id 
   */
  static goChapter(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Shows the "to top" button when the page is down by 20 lines.
   */
  static scrollFunction() {
    const topButton = document.getElementById("top-btn");

    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      topButton.style.display = "block";
    } else {
      topButton.style.display = "none";
    }
  }

  /**
   * Goes to the page top when the user clicks on the button
   */
  static toTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
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
      const descriptions = document.getElementsByClassName('intro');
      let href, pageName, start, blogTitle, blogIntro, attr;
      let page = document.getElementById('page-content');
      let pageCode = page.innerHTML;
      for (let i = 0; i < idx.length; i++) {
        blogTitle = idx[i].textContent.substring(1).replace(/\s+/g, "").trim();
        blogIntro = descriptions[i].textContent;
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
        attr = AppUtils.genarateAttributes(pageName, blogTitle, blogIntro);
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
   * @param {*} blogIntro 
   */
  static genarateAttributes(pageName, blogTitle, blogIntro) {
    const pageUrl = decodeURI(pageName);
    const body = document.body;
    const html = document.documentElement;

    const height = Math.round((Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight)) * 1.10);

    const github = 'https://youpingh.github.io/blogger/';
    const show = (pageUrl.includes('群聊') ? false : true);
    const iframeAttr = {
      title: blogTitle,
      show: show,
      src: `${github}#${pageUrl}`,
      width: 600,
      height: height,
      intro: blogIntro,
      iframe: `<iframe src="${github}#${pageUrl}" style='width:600px; height:${height}px;' frameborder="0"></iframe>`
    }
    // console.log(blogTitle, iframeAttr.iframe);
    return iframeAttr;
  }

  /**
   * Adjusts the page settings for different bloggers that use iFrame to reference this page.
   */
  static adjustPage() {
    const utils = AppUtils.getInstance();
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

    let origin = utils.blogger;
    if (!isFirefox) {
      origin = window.location.ancestorOrigins[0]; // TODO Firefox doesn't support this property
    }
    const isCreader = (origin && origin == utils.creader);
    console.log('origin:', origin, 'isCreader:', isCreader);

    // if the blog is loaded by an iFrame from a blogger site (creaders, blogger, etc.)
    // show the content section only. Otherwise, show the entire page (header, content, sidebar).
    if (window.self !== window.top) {
      utils.removeExtras();
      if (isCreader) { // add a blog index for creaders
        let blog = document.getElementsByClassName('blog')[0];
        blog.appendChild(utils.creaderIdx);
      }
    } else {
      const header = document.getElementById('page-header');
      const sidebar = document.getElementById('page-sidebar');
      if (header) { header.style.display = 'block' }
      if (sidebar) { sidebar.style.display = 'block' }
      utils.addListeners();
      console.log('The header and sidebar are turned on');
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Adds event listeners to the footer.
   */
  addListeners() {

    // add a footer event listener for my blog
    const home = document.getElementById('home-btn');
    home.addEventListener("click", () => {
      window.location.hash = '#htmls/home';
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // When the user scrolls down 20 lines from the top of the document, show the button
    window.onscroll = function () { AppUtils.scrollFunction() };
    const footer = document.getElementById('top-btn');
    footer.addEventListener('click', AppUtils.toTop);
    this.loadFooter = false;
    // console.log('Footer is loaded');

    let element = document.getElementById('tts-btn');
    element.addEventListener("click", () => {
      BlogReader.readBlog();
    });

    element = document.getElementById('translate-btn');
    element.addEventListener("click", () => {
      Translator.translatePost(true);
    });

    element = document.getElementById('re-translate-btn');
    element.addEventListener("click", () => {
      Translator.translatePost(false);
    });

    element = document.getElementById('back-btn');
    element.addEventListener("click", () => {
      location.reload();
    });

    // add an event handler to the language element
    element = document.getElementById('language');
    element.addEventListener("click", AppUtils.switchTOCLang);

    // add a clickable area to the banner
    const banner = document.getElementById('banner');
    const area = document.getElementById('map');
    const width = banner.width;
    const height = banner.height;
    const coords = [width * 0.05, height * 0.25, width * 0.55, height * 0.7];
    area.coords = coords[0] + ',' + coords[1] + ',' + coords[2] + ',' + coords[3];
  }

  static switchTOCLang() {
    const element = document.getElementById('language');
    const lang = element.lang;
    if (lang == 'zh-CN') {
      element.lang = 'en';
      element.className = 'fa-solid fa-language english-color';
    }
    else {
      element.lang = 'zh-CN';
      element.className = 'fa-solid fa-language chinese-color';
    };
    Sidebar.createTOCs(true);
  }

  /**
   * Removes some elements when the page is framed by other sites.
   */
  removeExtras() {
    const header = document.getElementById('page-header');
    const sidebar = document.getElementById('page-sidebar');
    const footer = document.getElementById('page-footer');
    if (header) { header.style.display = 'none'; header.remove(); }
    if (sidebar) { sidebar.style.display = 'none'; sidebar.remove(); }
    if (footer) { footer.style.display = 'none'; footer.remove(); }

    const content = document.getElementById('page-content');
    const body = document.body;
    content.className = 'page-content-blog';
    body.className = 'body-blog';
  }

  /**
   * Displays the code generation links.
   */
  static showCodeGenerator() {
    const host = window.location.host;
    const footer = document.getElementById('page-footer');
    const code = document.getElementById('code')
    const showGenerator = (host.startsWith('127.0.0.1') && code != null);
    if (showGenerator) {
      if (code) code.style.display = 'block';
      if (footer) footer.style.display = 'none';
      // console.log(document.body.innerHTML);
    } else {
      if (footer) footer.style.display = 'block';
      if (code) code.style.display = 'none';
    }
  }

  /**
   * Creates a Creaders blog index as a footer
   * @returns
   */
  static createIndex() {
    const idx = document.createElement('a');
    const img = document.createElement('img');
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
