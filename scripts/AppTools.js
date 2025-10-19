import { AllPosts } from './AllPosts.js';

/**
 * This is a utility to generate a <iframe> tage of a post page that is used by other bloggers.
 * This is used by tools.html only.
 */
export class AppTools {

  constructor() {
    this.blogName = null;
    this.categoryName = null;
    this.postName = null;
  }

  static getInstance() {
    if (!AppTools._instance) {
      AppTools._instance = new AppTools();
    }
    return AppTools._instance;
  }

  /**
   * Gets all blog names to create a list of options for the <select> tag.
   */
  static getBlogNames() {
    console.log('getting all blog names');
    const names = AllPosts.getBlogNames();
    const selection = document.getElementById('blog-names');
    selection.innerHTML = '';
    let option = null;
    names.forEach(name => {
      option = document.createElement("option");
      option.text = name;
      option.value = name;
      selection.appendChild(option);
    });

    if (!this.blogName) {
      this.blogName = names[0];
      this.getCategoryNames(this.blogName);
    }
  }

  /**
   * Gets all category names of the specified blog to create a list of options for the <select> tag.
   */
  static getCategoryNames(blogName) {
    console.log('getting all category names of', blogName);
    this.blogName = blogName;
    const names = AllPosts.getCategoryNames(blogName);
    const selection = document.getElementById('category-names');
    selection.innerHTML = '';
    let option = null;
    names.forEach(name => {
      option = document.createElement("option");
      option.text = name;
      option.value = name;
      selection.appendChild(option);
    })

    this.categoryName = names[0];
    this.getPostNames(this.categoryName);
  }

  /**
   * Gets all post names of the specified category to create a list of options for the <select> tag.
   */
  static getPostNames(categoryName) {
    console.log('getting all post names of', this.blogName, categoryName);
    this.categoryName = categoryName;
    const names = AllPosts.getPostNames(this.blogName, categoryName);
    const selection = document.getElementById('post-names');
    selection.innerHTML = '';
    let option = null;
    names.forEach(name => {
      option = document.createElement("option");
      option.text = name;
      option.value = name;
      selection.appendChild(option);
    })
    this.postName = names[0];
  }

  /**
   * Sets the postName for the code generation.
   * @param {*} postName 
   */
  static setPostName(postName) {
    console.log('setting post name:', this.blogName, this.categoryName, postName);
    this.postName = postName;
  }

  /**
   * Generates all posts' info and its iFrame code.
   * TODO this function is not working
   */
  static generateCodeAllPosts() {
    const blogNames = AllPosts.getBlogNames();
    blogNames.forEach(blogName => {
      this.blogName = blogName;
      const categoryNames = AllPosts.getCategoryNames(blogName);
      categoryNames.forEach(categoryName => {
        this.categoryName = categoryName;
        const postNames = AllPosts.getPostNames(blogName, categoryName);
        postNames.forEach(async postName => {
          this.postName = postName;
          await this.createPostCode();
        })
      })
    })
  }

  /**
   * Retrieves some basic information of the post page and generates an <iFrame> tag for
   * other blogs (creader, Blogger, etc.) to reference the page.
   */
  static async createPostCode() {
    console.log('creating code for:', this.blogName, this.categoryName, this.postName);

    const width = 610;
    const blogHost = 'https://youpingh.github.io/blogger/#';
    const localURL = `${this.blogName}/${this.categoryName}/${this.postName}.html`;
    let height = await this.getPageHeight(localURL);

    const info = `width: ${width} , height: ${height}`;
    const src = `src: ${blogHost}${this.blogName}/${this.categoryName}/${this.postName}`;
    const iframe = `<iframe src="${blogHost}${this.blogName}/${this.categoryName}/${this.postName}" style="width:${width}px; height:${height}px;" frameborder="0"></iframe>`;
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    const p3 = document.createElement('p');

    p1.textContent = info;
    p2.textContent = src;
    p3.textContent = iframe;

    const code = document.getElementById('post-code');
    code.innerHTML = '';
    code.append(p1, p2, p3);

    // "src": "https://youpingh.github.io/blogger/#blog/category/post",
    // "width": 610,
    // "height": 1038,
    // "iframe": "<iframe src='https://youpingh.github.io/blogger/#blog/category/post' style='width:610px; height:1038px;' frameborder='0'></iframe>"

  }

  /**
 * Correctly calculates the height of a dynamically loaded page.
 * It ensures measurement occurs AFTER the content is added to the DOM.
 * @param {string} src - The URL of the content to fetch.
 * @returns {Promise<number>} The calculated page height in pixels.
 */
  static async getPageHeight(src) {
    const page = document.getElementById('page-content');
    const code = document.getElementById('gen-code');

    // 1. Store and clear the code content (Good initial steps)
    const codeBackup = code.innerHTML;
    code.innerHTML = '';
    page.innerHTML = '';

    let height = 0;

    try {
      // 2. Fetch data (await the Promise)
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();

      // 3. Inject the content (DOM is now updated)
      page.innerHTML = data;

      // 4. ***CRITICAL FIX: Force a Reflow/Rerender***
      // By accessing an element's offsetHeight, we force the browser to
      // immediately recalculate the layout before we take the final measurement.
      // Accessing page.offsetHeight here forces the browser to apply the new content's height.
      const dummyRead = page.offsetHeight;

      // 5. Measure the height AFTER the DOM update and reflow
      const body = document.body;
      const html = document.documentElement;

      height = Math.round(
        Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        ) * 1.20 // Apply your 20% buffer
      );

    } catch (err) {
      console.error(`Loading ${src} failed:`, err);
      height = 0;
    } finally {
      // 6. Cleanup (Ensure this runs regardless of success/fail)
      page.innerHTML = '';
      code.innerHTML = codeBackup;
    }

    return height;
  }
}

window.AppTools = AppTools;
