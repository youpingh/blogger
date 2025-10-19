import { AllPosts } from './AllPosts.js';

/**
 * This is a sidebar utility to create a sidebar with a TOC.
 */
export class Sidebar {

	constructor() {
		let blog = AllPosts.ALL_POSTS.find(item => item.blogName === 'afanti2');
		this.visiableLabel = blog.categories[0].name;
	}

	static getInstance() {
		if (!Sidebar._instance) {
			Sidebar._instance = new Sidebar();
		}
		return Sidebar._instance;
	}

	/**
	 * Creates a TOC in the sidebar.
	 */
	static createTOCs() {
		const sidebar = this.getInstance();
		AllPosts.ALL_POSTS.forEach(blog => {
			// console.log('blog name:', blog.blogName);
			const blogName = blog.blogName;
			const toc = document.getElementById(blogName);
			const ullist = toc.querySelectorAll('ul');
			const pList = toc.querySelectorAll('p');

			// clean the previous
			if (ullist.length > 0) {
				ullist.forEach(e => { e.remove() });
				pList.forEach(e => { if (e.className != 'sidebar-title') e.remove() });
			}

			// create toc for each category
			blog.categories.forEach(category => {
				// console.log('category name:', category.name);
				if (category.show) {
					const label = sidebar.createCategoryLabel(category.name);
					const categoryTOC = sidebar.createCategoryTOC(blogName, category);
					toc.appendChild(label);
					toc.appendChild(categoryTOC);
				}
			})
		})
	}

	/**
	 * Create a TOC for the specified category
	 * @param {*} category 
	 * @param {*} label 
	 * @param {*} posts 
	 */
	createCategoryTOC(blogName, category) {
		const language = document.getElementById('language');
		const isEnglish = (language.lang == 'en');
		const label = category.name;
		const show = (this.visiableLabel == label);

		// create a UL element and a list of LI elements for the post titles
		const ul = document.createElement('ul');
		ul.id = 'ul-' + label;
		ul.className = (isEnglish ? 'sidebar-post-english' : 'sidebar-post');
		ul.style.display = (show ? 'block' : 'none');

		category.posts.forEach(post => {
			// console.log('post:', post.title);
			if (post.show) {
				const title = ((isEnglish && post.titleEnglish.length > 0) ? post.titleEnglish : post.title);
				const link = '<a href="#' + blogName + '/' + label + '/' + post.title + '">' + title + '</a>';
				const li = document.createElement('li');
				li.innerHTML = link;
				ul.appendChild(li);
				// console.log('link:', link);
			}
		});
		return ul;
	}

	/**
	 * Creates a <p> element for the category labe
	 * @param {*} categoryName 
	 */
	createCategoryLabel(categoryName) {
		const label = document.createElement('p');
		label.id = categoryName;
		label.textContent = '+ ' + categoryName;
		label.title = 'Click to expand/hide';
		label.className = 'sidebar-label';
		label.onclick = function () { Sidebar.showPostLabels(this.id); };
		return label;
	}

	/**
	 * Shows or hides the posts for the specified lable
	 */
	static showPostLabels(label) {
		const sidebar = Sidebar.getInstance();

		// hide the current label
		let ulid = 'ul-' + sidebar.visiableLabel;
		let ul = document.getElementById(ulid);
		if (ul) {
			ul.style.display = 'none';
		}
		
		// show the selected label
		sidebar.visiableLabel = label;
		ulid = 'ul-' + label;
		ul = document.getElementById(ulid);
		if (ul.style.display === 'none') {
			ul.style.display = 'block';
		} else {
			ul.style.display = 'none';
		}
	}

	//
	// Utilities
	//
	/**
	 * Creates a new AllPosts object with English translations.
	 */
	// static printPostTitles() {
	// 	let post, title, titleEnglish, introEnglish, newpost;
	// 	let newposts = [];
	// 	console.log('all post:', AllPosts.ALL_POSTS.length, 'all title:', AllTitles.ALL_TITLES.length);
	// 	for (let i = 0; i < AllPosts.ALL_POSTS.length; i++) {
	// 		post = AllPosts.ALL_POSTS[i];
	// 		title = AllTitles.ALL_TITLES[i];
	// 		titleEnglish = Sidebar.getEnglish(title.title);
	// 		introEnglish = Sidebar.getEnglish(title.intro);
	// 		newpost = {
	// 			"title": post.title,
	// 			"titleEnglish": titleEnglish,
	// 			"show": post.show,
	// 			"src": post.src,
	// 			"width": post.width,
	// 			"height": post.height,
	// 			"intro": post.intro,
	// 			"introEnglish": introEnglish,
	// 			"iframe": post.iframe
	// 		}
	// 		newposts.push(newpost);
	// 	}

	// 	const code = JSON.stringify(newposts, null, 2);
	// 	console.log(code);
	// 	// "title": "读《人类简史》 ---- Reading Sapiens: A Brief History of Humankind"
	// }

	// static getEnglish(text) {
	// 	let idx = text.indexOf(' ---- ');
	// 	return text.substring(idx + 6);
	// }
}

window.Sidebar = Sidebar;
