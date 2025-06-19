import { AllPosts } from './AllPosts.js';
import { AllTitles } from './AllTitles.js';

/**
 * This is a sidebar utility to create a sidebar with a TOC.
 */
export class Sidebar {

	constructor() {
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
	static createTOCs(force) {
		const sidebar = this.getInstance();
		for (let i = 1; i < 3; i++) {
			const category = 'afanti' + i;
			const toc = document.getElementById(category);
			let ullist = toc.querySelectorAll('ul');
			let pList = toc.querySelectorAll('p');
			if (force || ullist.length == 0) {
				if (ullist.length > 0) {
					ullist.forEach(e => { e.remove() });
					pList.forEach(e => { if (e.className != 'sidebar-title') e.remove() });
				}
				const categoryPosts = AllPosts.ALL_POSTS.filter(item => (item.src.includes(category) && item.show));
				const groups = sidebar.createGroups(categoryPosts);
				const labels = Object.keys(groups);
				let show = false;

				for (let j = 0; j < labels.length; j++) {
					show = (j == 0 && i == 2 ? true : false);
					sidebar.createLabelTOC(category, labels[j], groups[labels[j]], show);
				}
			}
		}
	}

	/**
	 * Shows or hides the posts for the specified lable
	 */
	static showPostLabels(label) {
		const ulid = 'ul-' + label;
		let ul = document.getElementById(ulid);
		if (ul.style.display === 'none') {
			ul.style.display = 'block';
		} else {
			ul.style.display = 'none';
		}
	}

	/**
	 * Creates a list of titles grouped by label
	 * https://host/#afanti2/label/title
	 * @param {*} posts 
	 * @returns 
	 */
	createGroups(posts) {
		const groups = {};
		posts.forEach(item => {
			const parts = item.src.split('/');
			const key = parts[5]; // 6th item: label name
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
		});
		return groups;
	}

	/**
	 * Create a TOC for the specified label
	 * @param {*} category 
	 * @param {*} label 
	 * @param {*} posts 
	 * @param {*} show 
	 */
	createLabelTOC(category, label, posts, show) {
		const language = document.getElementById('language');
		const isEnglish = language.lang == 'en';

		let toc = document.getElementById(category);
		let p, ul, li, link, title, post;

		// create a <p> element for the label
		p = document.createElement('p');
		p.id = label;
		p.textContent = '+ ' + label;
		p.title = 'Click to expand/hide';
		p.className = 'sidebar-label';
		p.onclick = function () { Sidebar.showPostLabels(this.id); };
		toc.appendChild(p);

		// create a UL element and a list of LI elements for the post titles
		ul = document.createElement('ul');
		ul.id = 'ul-' + label;
		ul.className = (isEnglish ? 'sidebar-post-english' : 'sidebar-post');
		ul.style.display = (show ? 'block' : 'none');

		for (let i = 0; i < posts.length; i++) {
			post = posts[i];
			title = (isEnglish ? post.titleEnglish : post.title);
			link = '<a href="#' + category + '/' + label + '/' + post.title + '">' + title + '</a>';
			li = document.createElement('li');
			li.innerHTML = link;
			ul.appendChild(li);
		}
		toc.appendChild(ul);
		// console.log(bookIdx.innerHTML);
	}

	/**
	 * Creates a new AllPosts object with English translations.
	 */
	static printPostTitles() {
		let post, title, titleEnglish, introEnglish, newpost;
		let newposts = [];
		console.log('all post:', AllPosts.ALL_POSTS.length, 'all title:', AllTitles.ALL_TITLES.length);
		for (let i = 0; i < AllPosts.ALL_POSTS.length; i++) {
			post = AllPosts.ALL_POSTS[i];
			title = AllTitles.ALL_TITLES[i];
			titleEnglish = Sidebar.getEnglish(title.title);
			introEnglish = Sidebar.getEnglish(title.intro);
			newpost = {
				"title": post.title,
				"titleEnglish": titleEnglish,
				"show": post.show,
				"src": post.src,
				"width": post.width,
				"height": post.height,
				"intro": post.intro,
				"introEnglish": introEnglish,
				"iframe": post.iframe
			}
			newposts.push(newpost);
		}

		const code = JSON.stringify(newposts, null, 2);
		console.log(code);
		// "title": "读《人类简史》 ---- Reading Sapiens: A Brief History of Humankind"
	}

	static getEnglish(text) {
		let idx = text.indexOf(' ---- ');
		return text.substring(idx + 6);
	}
}

window.Sidebar = Sidebar;
